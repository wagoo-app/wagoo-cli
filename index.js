#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import { createSpinner } from "nanospinner";
import boxen from "boxen";
import { exec } from "child_process";
import YAML from "yaml"; // 📌 nouvelle dépendance à installer : npm i yaml

const program = new Command();
program
  .name("wagoo")
  .description("CLI Wagoo (gestion projet & versions)")
  .version("1.0.0");

const filePath = path.join(process.cwd(), ".wagoo-config");

// -------- Fonctions utilitaires --------
function checkConfig() {
  if (!fs.existsSync(filePath)) {
    console.log(
      chalk.red(
        ".wagoo-config introuvable. Veuillez exécuter 'wagoo init' d'abord."
      )
    );
    process.exit(1);
  }
  return YAML.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveConfig(data) {
  fs.writeFileSync(filePath, YAML.stringify(data), "utf8");
}

async function safePrompt(questions) {
  try {
    return await inquirer.prompt(questions);
  } catch (err) {
    if (err && err.name === "ExitPromptError") {
      console.log("\n" + chalk.yellow("Opération annulée par l'utilisateur."));
      process.exit(0);
    }
    throw err;
  }
}

program
  .command("r <nom_command>")
  .description("Exécuter une commande définie dans .wagoo-config")
  .action((nom_command) => {
    const data = checkConfig();

    if (!data.commands || data.commands.length === 0) {
      console.log(chalk.red("⚠️ Aucune commande définie dans .wagoo-config."));
      process.exit(1);
    }

    const cmd = data.commands.find(
      (c) => c.nom_command.toLowerCase() === nom_command.toLowerCase()
    );

    if (!cmd) {
      console.log(
        chalk.red(
          `❌ La commande '${nom_command}' n’existe pas dans .wagoo-config.`
        )
      );
      console.log(chalk.yellow("📜 Commandes disponibles :"));
      data.commands.forEach((c) =>
        console.log(
          `   • ${chalk.cyan(c.nom_command)} → ${chalk.gray(c.action_commands)}`
        )
      );
      process.exit(1);
    }

    console.log(chalk.green(`🚀 Exécution : ${cmd.action_commands}`));
    const child = exec(cmd.action_commands, { stdio: "inherit", shell: true });

    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);

    child.on("exit", (code) => {
      if (code === 0) {
        console.log(
          chalk.green(`✅ Commande '${nom_command}' terminée avec succès !`)
        );
      } else {
        console.log(
          chalk.red(
            `❌ Erreur : la commande s'est terminée avec le code ${code}.`
          )
        );
      }
    });
  });

program
  .command("init")
  .description("Initialiser un projet Wagoo CLI")
  .action(async () => {
    if (fs.existsSync(filePath)) {
      console.log(
        chalk.yellow(".wagoo-config existe déjà. Aucune action effectuée.")
      );
      return;
    }

    const answers = await safePrompt([
      {
        type: "input",
        name: "name",
        message: "Nom du projet :",
        default: "mon-projet",
      },
      {
        type: "input",
        name: "description",
        message: "Description du projet :",
        default: "Description du projet",
      },
      {
        type: "input",
        name: "link",
        message: "Lien du projet :",
        default: "http://localhost:3000",
      },
      {
        type: "list",
        name: "visual",
        message: "Choisir le type de visuel du projet :",
        choices: ["default", "Next.js"],
        default: "default",
      },
    ]);

    const spinner = createSpinner(
      "Création du fichier .wagoo-config..."
    ).start();
    await new Promise((res) => setTimeout(res, 1000));
    let data = {};
    if (answers.visual === "Next.js") {
      data = {
        name: answers.name,
        description: answers.description,
        version: {
          major: 0,
          minor: 0,
          patch: 0,
          name_version: "",
          note_version: "",
        },
        links: [
          {
            name: "Frontend",
            url: answers.link,
          },
        ],
        commands: [
          {
            nom_command: "version",
            description: "Afficher la version de Wagoo",
            action_commands: "wagoo version",
          },
          {
            nom_command: "dev",
            description: "Démarrer le serveur de développement",
            action_commands: "npm run dev",
          },
          {
            nom_command: "docker",
            description: "Démarrer le projet avec Docker",
            action_commands: "docker compose up -d",
          },
          {
            nom_command: "prisma",
            description: "Lancer Prisma Studio",
            action_commands: "npx prisma studio",
          },
          {
            nom_command: "build",
            description: "Construire le projet",
            action_commands: "npm run build",
          },
          {
            nom_command: "start",
            description: "Démarrer le projet",
            action_commands: "npm run start",
          },
        ],
      };
    } else {
      data = {
        name: answers.name,
        description: answers.description,
        version: {
          major: 0,
          minor: 0,
          patch: 0,
          name_version: "",
          note_version: "",
        },
        links: [
          {
            name: "Frontend",
            url: answers.link,
          },
        ],
        commands: [
          {
            nom_command: "version",
            description: "Affiche la version actuelle du projet",
            action_commands: "wagoo version",
          },
        ],
      };
    }

    // Sauvegarde YAML
    fs.writeFileSync(filePath, YAML.stringify(data), "utf8");
    spinner.success({
      text: chalk.green("Fichier .wagoo-config (YAML) créé avec succès !"),
    });

    console.log(
      chalk.blue(figlet.textSync(answers.name, { horizontalLayout: "full" }))
    );
    console.log(chalk.green("\nConfiguration de base (YAML):"));
    console.log(chalk.yellow(YAML.stringify(data)));
  });

// -------- Commande c (liste + add) --------
program
  .command("c")
  .description("Lister ou ajouter des commandes")
  .option("-a, --add", "Ajouter une nouvelle commande")
  .action(async (options) => {
    const data = checkConfig();

    if (options.add) {
      const answers = await safePrompt([
        {
          type: "input",
          name: "nom_command",
          message: "Nom de la nouvelle commande :",
        },
        {
          type: "input",
          name: "action_commands",
          message: "Action de la commande :",
        },
      ]);

      data.commands.push({
        nom_command: answers.nom_command,
        action_commands: answers.action_commands,
      });

      const spinner = createSpinner("Ajout de la commande...").start();
      await new Promise((res) => setTimeout(res, 1000));
      saveConfig(data);
      spinner.success({
        text: chalk.green("Nouvelle commande ajoutée avec succès !"),
      });
    }

    if (!data.commands || data.commands.length === 0) {
      console.log(chalk.yellow("Aucune commande trouvée."));
      return;
    }

    console.log(chalk.blue("Liste des commandes :"));
    data.commands.forEach((cmd, index) => {
      console.log(
        chalk.yellow(
          `${index + 1}. ${cmd.nom_command} → ${cmd.action_commands}`
        )
      );
    });
  });

// -------- Commande version --------
program
  .command("version")
  .description("Afficher ou configurer la version")
  .option("--config", "Modifier name_version")
  .action(async (options) => {
    const data = checkConfig();

    if (options.config) {
      const answer = await safePrompt([
        {
          type: "input",
          name: "name_version",
          message: "Nom de la version :",
          default: data.version.name_version || "",
        },
      ]);

      const spinner = createSpinner("Mise à jour de name_version...").start();
      await new Promise((res) => setTimeout(res, 1000));
      data.version.name_version = answer.name_version;
      saveConfig(data);
      spinner.success({
        text: chalk.green("name_version mis à jour avec succès !"),
      });
    } else {
      const versionBox = boxen(
        `📦 Version : ${chalk.bold.blue(
          data.version.name_version || "non définie"
        )}\n` +
          `📝 Note   : ${chalk.yellow(
            data.version.note_version || "non définie"
          )}`,
        {
          padding: { top: 0, right: 1, bottom: 0, left: 1 },
          margin: 1,
          borderColor: "cyan",
          borderStyle: "round",
          title: "Wagoo Project",
          titleAlignment: "center",
        }
      );
      console.log(versionBox);
    }
  });

// -------- Commande versions --------
program
  .command("versions")
  .description("Afficher note_version")
  .action(() => {
    const data = checkConfig();
    console.log(
      chalk.blue(`note_version : ${data.version.note_version || "non définie"}`)
    );
  });

// -------- Commande info --------
program
  .command("info")
  .description(
    "Afficher toutes les informations du projet depuis .wagoo-config"
  )
  .action(() => {
    const data = checkConfig();

    const projectInfo = `${chalk.bold("📛 Nom :")} ${chalk.cyan(data.name)}
${chalk.bold("🔗 Lien :")} ${chalk.blue(data.link)}
${chalk.bold("📝 Description :")} ${chalk.white(data.description)}

${chalk.bold("📦 Version :")} ${chalk.green(
      data.version.name_version || "non définie"
    )}
   • Major : ${data.version.major}
   • Minor : ${data.version.minor}
   • Patch : ${data.version.patch}
   • Note  : ${chalk.yellow(data.version.note_version || "non définie")}

${chalk.bold("📜 Commandes disponibles :")}
${(data.commands || [])
  .map(
    (cmd, i) =>
      `   ${i + 1}. ${chalk.cyan(cmd.nom_command)} → ${chalk.gray(
        cmd.action_commands
      )} (${chalk.blue(cmd.description || "pas de description")})`
  )
  .join("\n")}`.trim();

    const infoBox = boxen(projectInfo, {
      padding: { top: 0, right: 1, bottom: 0, left: 1 },
      margin: 1,
      borderColor: "green",
      borderStyle: "round",
      title: "Wagoo Project Info",
      titleAlignment: "center",
    });

    console.log(infoBox);
  });

// -------- Commande bump --------
program
  .command("bump")
  .description(
    "Incrémenter la version (patch, minor, major) et créer un commit Git"
  )
  .action(async () => {
    const data = checkConfig();

    if (!data.version) {
      console.log(
        chalk.red("Le fichier .wagoo-config n’a pas de champ version.")
      );
      process.exit(1);
    }

    const { bumpType } = await safePrompt([
      {
        type: "list",
        name: "bumpType",
        message: "Quelle partie de la version voulez-vous incrémenter ?",
        choices: ["patch", "minor", "major"],
      },
    ]);

    if (bumpType === "patch") data.version.patch += 1;
    else if (bumpType === "minor") {
      data.version.minor += 1;
      data.version.patch = 0;
    } else if (bumpType === "major") {
      data.version.major += 1;
      data.version.minor = 0;
      data.version.patch = 0;
    }

    const newVersion = `${data.version.major}.${data.version.minor}.${data.version.patch}`;
    const nameVersion = data.version.name_version || "";

    const { extraMessage } = await safePrompt([
      {
        type: "input",
        name: "extraMessage",
        message: "Message additionnel pour le commit (facultatif) :",
      },
    ]);

    let note = `Updated to v${newVersion}`;
    if (nameVersion) note += ` (${nameVersion})`;
    if (extraMessage?.trim()) note += ` - ${extraMessage.trim()}`;
    data.version.note_version = note;

    saveConfig(data);

    exec("git rev-parse --abbrev-ref HEAD", (err, stdout) => {
      if (err) {
        console.log(
          chalk.red(`Impossible de récupérer la branche : ${err.message}`)
        );
        return;
      }

      const branchName = stdout.trim();
      let commitMessage = `update ${branchName} v${newVersion}`;
      if (extraMessage?.trim()) commitMessage += ` - ${extraMessage.trim()}`;

      exec(
        `git add .wagoo-config && git commit -m "${commitMessage}" && git push origin ${branchName}`,
        (err2) => {
          if (err2)
            console.log(chalk.red(`Erreur lors du commit : ${err2.message}`));
          else
            console.log(
              chalk.green(
                `✅ Version bumpée à ${newVersion} (${
                  nameVersion || "no name"
                }) et commit effectué !`
              )
            );
        }
      );
    });
  });

program.parse(process.argv);
