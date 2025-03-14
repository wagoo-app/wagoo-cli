#!/usr/bin/env node

import { Command } from "commander";
import { execSync } from "child_process";
import fs, { link } from "fs";
import readline from "readline";
import { fileURLToPath } from "url";
import path from "path";
import hidefile from "hidefile";
import { exit } from "process";
import open from "open";
import chalk from "chalk";
import boxen from "boxen";
import ora from "ora";
import yoctoSpinner from "yocto-spinner";

const program = new Command();

// Créer l'interface pour l'entrée utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Fonction pour vérifier si une commande est disponible
const checkCommand = (cmd) => {
  try {
    execSync(cmd, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

// Vérifier si l'installation a déjà été effectuée
const checkIfInstalled = () => {
  const wagooConfigPath = path.resolve("wagoo-app", ".wagoo", "check.json");
  const wagooInConfigPath = path.resolve(".wagoo", "check.json");

  // Vérifie si l'un des fichiers de config existe et si le répertoire .wagoo est présent
  if (fs.existsSync(wagooConfigPath)) {
    const configContent = fs.readFileSync(wagooConfigPath, "utf-8");
    const config = JSON.parse(configContent);
    if (config.status === "installed") {
      return true; // Déjà installé
    }
  } else if (fs.existsSync(wagooInConfigPath)) {
    const configContent = fs.readFileSync(wagooInConfigPath, "utf-8");
    const config = JSON.parse(configContent);
    if (config.status === "installed") {
      return true; // Déjà installé
    }
  } else {
    // Si les fichiers de config ne sont pas trouvés, l'installation n'est pas effectuée
    console.log("⚠️ wagoo n'est pas installé.");
    return false; // Pas installé
  }

  console.log("⚠️ wagoo n'est pas installé.");
  return false; // Pas installé
};

// Commande pour installer les dépendances et configurer le projet
program
  .command("new")
  .description("Installer les dépendances et configurer le projet")
  .action(() => {
    try {
      const sippner = ora({
        text: "Vérification du répertoire...",
        color: "cyan",
      }).start();

      // Vérifier si le dossier wagoo-app existe déjà
      const wagooAppDir = path.resolve("wagoo-app");
      if (fs.existsSync(wagooAppDir)) {
        console.log(
          "❌ Le dossier 'wagoo-app' existe déjà. Veuillez supprimer ou renommer ce dossier avant de réessayer."
        );
        rl.close();
        process.exit(1);
      }

      // Vérifier si le projet est déjà installé
      if (checkIfInstalled()) {
        console.log(
          "❌ Abandon de l'installation, car le projet est déjà installé."
        );
        rl.close();
        process.exit(1);
      }

      const repoPath = "wagoo-app"; // Chemin où le repo doit être cloné
      const wagooAppPath = path.resolve("wagoo-app"); // Définir le chemin pour wagoo-app
      const wagooDashAppPath = path.resolve("wagoo-app/dash"); // Définir le chemin pour wagoo-app

      sippner.text = "📥 Clonage du repository...";

      try {
        // Décommentez cette ligne pour effectuer le clonage réel si vous avez l'autorisation
        execSync("git clone https://github.com/wagoo-app/wagoo-app.git", {
          stdio: "ignore",
        });
        sippner.text = "📦 Installation des dépendances 1/3";
        // Installer les dépendances du projet principal

        // Changer de répertoire pour installer les dépendances de 'dash'
        const WagooInstall = path.join(wagooAppPath);
        process.chdir(WagooInstall);
        execSync("npm install", { stdio: "ignore" });

        sippner.text = "📦 Installation des dépendances 2/3";
        const dashPath = path.join(wagooAppPath, "dash");
        process.chdir(dashPath);
        execSync("npm install", { stdio: "ignore" });
        execSync("composer install", { stdio: "ignore" });
        dependance_two.success("Terminer");

        // const desktopApp = path.join(wagooAppPath, "desktop");
        // process.chdir(desktopApp);
        // execSync("npm install", { stdio: "ignore" });

        // Changer de répertoire pour installer les dépendances de 'app_desktop'

        // Copier le fichier .env
        sippner.text = "📦 Installation des dépendances 3/3";

        // Installer les dépendances du projet statique
        console.log(" Installation des dépendances du projet statique...");
        const staticPath = path.join(wagooAppPath, "static", "v1", "dash");
        if (fs.existsSync(staticPath)) {
          process.chdir(staticPath);
          execSync("npm install", { stdio: "ignore" });
        } else {
          console.error(`❌ Le répertoire ${staticPath} n'existe pas.`);
          process.exit(1);
        }

        sippner.text = "✏️ Configuration sumplémenantaire 1/5";
        const configPath = path.join(wagooAppPath, "dash", "app", "config");
        process.chdir(configPath);
        fs.copyFileSync(".env.example", ".env");

        // Marquer l'installation comme terminée avec un fichier JSON
        sippner.text = "✏️ Configuration sumplémenantaire 2/5";

        const wagooDir = path.resolve(wagooAppPath, ".wagoo");
        if (!fs.existsSync(wagooDir)) {
          fs.mkdirSync(wagooDir);
          hidefile.hideSync(wagooDir);
        }
        sippner.text = "✏️ Configuration sumplémenantaire 3/5";
        // Configuration pour écrire dans le fichier config.json
        const config = { status: "installed" };
        fs.writeFileSync(
          path.resolve(wagooDir, "check.json"),
          JSON.stringify(config, null, 2)
        );

        // Marquer l'installation comme terminée avec un fichier JSON
        sippner.text = "✏️ Configuration sumplémenantaire 4/5";
        const dashDir = path.resolve(wagooDashAppPath, ".dash");
        if (!fs.existsSync(dashDir)) {
          fs.mkdirSync(dashDir);
          hidefile.hideSync(dashDir);
        }
        sippner.text = "✏️ Configuration sumplémenantaire 5/5";
        // Configuration pour écrire dans le fichier config.json
        const configDash = { status: "installed" };
        fs.writeFileSync(
          path.resolve(dashDir, "config.json"),
          JSON.stringify(configDash, null, 2)
        );

        spinner.succeed(chalk.green("🎉 Installation terminée avec succès !"));
        console.log(
          boxen(
            chalk.green.bold("Projet installé avec succès 🎉\n\n") +
              chalk.cyan("Dossier: ") +
              chalk.yellow(wagooAppPath),
            { padding: 1, borderStyle: "round", borderColor: "green" }
          )
        );

        rl.close();
        process.exit(0);
      } catch (error) {
        console.error(
          "❌ Vous n'avez pas la permission de cloner le repository wagoo."
        );
        console.error(error);
        process.exit(1);
      }
    } catch (error) {
      console.error("❌ Une erreur s'est produite lors de l'installation.");
      console.error(error);
      rl.close();
      process.exit(1);
    }
  });

// Commande pour lancer la génération du css

program
  .command("push")
  .description("Add, commit and push to the repository")
  .action(() => {
    try {
      // Vérifier la présence du dossier .wagoo
      const check = path.join(process.cwd(), ".wagoo");
      if (!fs.existsSync(check)) {
        console.error(
          "❌ Cette commande ne fonctionne que dans un dossier du projet."
        );
        process.exit(1); // Stoppe le processus si le dossier n'est pas présent
      }

      console.log("🖋️ Load for push");

      try {
        execSync("git add .", { stdio: "ignore" });
        execSync('git commit -m "Push from wagoo-cli"', { stdio: "ignore" });
        execSync("git push", { stdio: "ignore" });
        console.log("🖋️ Push finish");
        process.exit(1);
      } catch (error) {
        console.error(
          "❌ Erreur lors de l'exécution de la commande tailwindcss."
        );
        console.error(error);
        process.exit(1);
      }
    } catch (error) {
      console.error("❌ Une erreur s'est produite lors de l'installation.");
      console.error(error);
      process.exit(1);
    }
  });

program
  .command("css")
  .description("Lancer tailwindcss pour générer le fichier css")
  .action(() => {
    try {
      // Vérifier la présence du dossier .wagoo
      const check = path.join(process.cwd(), ".wagoo");
      if (!fs.existsSync(check)) {
        console.error(
          "❌ Cette commande ne fonctionne que dans un dossier du projet."
        );
        process.exit(1); // Stoppe le processus si le dossier n'est pas présent
      }

      console.log("🖋️ Chargement du css");

      try {
        execSync(
          "npx @tailwindcss/cli -i ./dash/assets/css/input.css -o ./static/v1/dash/css/output.css --watch",
          { stdio: "ignore" }
        );
      } catch (error) {
        console.error(
          "❌ Erreur lors de l'exécution de la commande tailwindcss."
        );
        console.error(error);
        process.exit(1);
      }
    } catch (error) {
      console.error("❌ Une erreur s'est produite lors de l'installation.");
      console.error(error);
      process.exit(1);
    }
  });

program
  .command("build")
  .description("Lancer tailwindcss pour générer le fichier css")
  .action(() => {
    try {
      // Vérifier la présence du dossier .wagoo
      const check = path.join(process.cwd(), ".wagoo");
      if (!fs.existsSync(check)) {
        console.error(
          "❌ Cette commande ne fonctionne que dans un dossier du projet."
        );
        process.exit(1); // Stoppe le processus si le dossier n'est pas présent
      }

      console.log("🖋️ Chargement du css");
      const wagooDirectory = path.join(process.cwd());
      try {
        const desktopApp = path.join(wagooDirectory, "desktop");
        process.chdir(desktopApp);
        execSync("npm run build", { stdio: "ignore" });
        console.log("🎉 Build terminé!");
        rl.close();
        process.exit(0);
      } catch (error) {
        console.error(
          "❌ Erreur lors de l'exécution de la commande tailwindcss."
        );
        console.error(error);
        process.exit(1);
      }
    } catch (error) {
      console.error("❌ Une erreur s'est produite lors de l'installation.");
      console.error(error);
      process.exit(1);
    }
  });

program
  .command("code")
  .description("Lancer tailwindcss pour générer le fichier css")
  .action(() => {
    try {
      // Vérifier la présence du dossier .wagoo
      const check = path.join(process.cwd(), ".wagoo");
      if (!fs.existsSync(check)) {
        console.error(
          "❌ Cette commande ne fonctionne que dans un dossier du projet."
        );
        process.exit(1); // Stoppe le processus si le dossier n'est pas présent
      }

      console.log("🖋️ Chargement du css");
      const wagooDirectory = path.join(process.cwd());
      try {
        process.chdir(wagooDirectory);
        execSync('"Wagoo SAAS.code-workspace"', { stdio: "ignore" });
        console.log("🎉 Build terminé!");
        rl.close();
        process.exit(0);
      } catch (error) {
        console.error(
          "❌ Erreur lors de l'exécution de la commande tailwindcss."
        );
        console.error(error);
        process.exit(1);
      }
    } catch (error) {
      console.error("❌ Une erreur s'est produite lors de l'installation.");
      console.error(error);
      process.exit(1);
    }
  });

program
  .command("open")
  .description("Lancer le site web dans le navigateur")
  .action(() => {
    try {
      // Vérifier la présence du dossier .wagoo
      const check = path.join(process.cwd(), ".wagoo");
      if (!fs.existsSync(check)) {
        console.error(
          "❌ Cette commande ne fonctionne que dans un dossier du projet."
        );
        process.exit(1);
      }

      const wagooInConfigPath = path.resolve(".wagoo", "config.json");

      // Vérifier l'existence du fichier config.json
      if (!fs.existsSync(wagooInConfigPath)) {
        console.error(
          "❌ Le fichier config.json est introuvable dans le dossier .wagoo."
        );
        process.exit(1);
      }

      const configContent = fs.readFileSync(wagooInConfigPath, "utf-8");
      const config = JSON.parse(configContent);

      if (!config.link) {
        console.error(
          "❌ Aucun lien de navigateur configuré dans config.json."
        );
        process.exit(1);
      }

      const lien_browser = config.link;
      console.log("🖋️ Ouverture du site web dans le navigateur...");
      console.log(`🌐 Lien : ${lien_browser}`);

      open(lien_browser)
        .then(() => {
          console.log("✅ Site web ouvert avec succès.");

          setTimeout(() => {
            process.exit(0);
          }, 2000);
        })
        .catch((err) => {
          console.error("❌ Erreur lors de l'ouverture du navigateur :", err);
          process.exit(1);
        });
    } catch (error) {
      console.error("❌ Une erreur s'est produite.");
      console.error(error);
      process.exit(1);
    }
  });

program
  .command("version")
  .description("Afficher la version de wagoo-cli")
  .action(() => {
    const check = path.join(process.cwd(), ".wagoo");
    if (!fs.existsSync(check)) {
      console.error(
        chalk.red.bold(
          "❌ Cette commande ne fonctionne que dans un dossier du projet."
        )
      );
      process.exit(1);
    }

    const packageJsonPath = path.join(process.cwd(), ".wagoo", "config.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const version = `${packageJson.version.major}.${packageJson.version.minor}.${packageJson.version.patch}`;

      console.log(
        boxen(
          `${chalk.cyan.bold(packageJson.name)} ${chalk.green(`v${version}`)}`,
          {
            padding: 1,
            margin: 1,
            borderStyle: "round",
            borderColor: "cyan",
          }
        )
      );
      process.exit(0);
    } else {
      console.error(
        chalk.red.bold("❌ Impossible de trouver le fichier config.json.")
      );
      process.exit(1);
    }
  });

program
  .command("patch")
  .description(
    "Créer un patch en incrémentant le numéro de version et en pushant sur GitHub"
  )
  .action(() => {
    try {
      const check = path.join(process.cwd(), ".wagoo");
      if (!fs.existsSync(check)) {
        console.error(
          "❌ Cette commande ne fonctionne que dans un dossier du projet."
        );
        process.exit(1);
      }

      const configPath = path.resolve(".wagoo", "config.json");

      // Vérifier si le fichier config.json existe
      if (!fs.existsSync(configPath)) {
        console.error("❌ Le fichier config.json est introuvable.");
        process.exit(1);
      }

      // Lire le fichier de configuration
      const configContent = fs.readFileSync(configPath, "utf-8");
      const config = JSON.parse(configContent);

      if (config.status !== "installed") {
        console.error("❌ Le projet n'est pas installé correctement.");
        process.exit(1);
      }

      // Incrémentation du patch
      config.version.patch += 1;
      const newVersion = `${config.version.major}.${config.version.minor}.${config.version.patch}`;

      console.log(`🚀 Nouvelle version : ${newVersion}`);

      // Écrire la mise à jour dans le fichier config.json
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
      console.log("✅ config.json mis à jour avec succès.");

      // Ajouter, commit et push sur GitHub
      try {
        execSync("git add .", { stdio: "ignore" });
        execSync(`git commit -m "New version : ${newVersion}"`, {
          stdio: "ignore",
        });
        execSync("git push", { stdio: "ignore" });

        console.log("🚀 Patch créé et poussé sur GitHub avec succès !");
      } catch (error) {
        console.error("❌ Erreur lors du commit/push Git :", error.message);
      }
    } catch (error) {
      console.error("❌ Une erreur s'est produite :", error.message);
      process.exit(1);
    }
  });

program
  .command("loaders")
  .description("Installer les dépendances et configurer le projet")
  .action(async () => {
    try {
      const clonage = ora({
        text: "Vérification du répertoire...",
        color: "cyan",
      }).start();
      await new Promise((resolve) => setTimeout(resolve, 2000));
      clonage.text = "📥 Clonage du repository...";
      await new Promise((resolve) => setTimeout(resolve, 2000));
      clonage.succeed(chalk.green("🎉 Installation terminée avec succès !"));

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const dependance = ora({
        text: "📦 Installation des dépendances 1/3",
        color: "cyan",
      }).start();
      await new Promise((resolve) => setTimeout(resolve, 2000));
      dependance.text = "📦 Installation des dépendances 2/3";
      await new Promise((resolve) => setTimeout(resolve, 2000));
      dependance.text = "📦 Installation des dépendances 3/3";
      await new Promise((resolve) => setTimeout(resolve, 2000));
      clonage.succeed(
        chalk.green("📦 Installation des dépendances : Termnier")
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const textnewtropbien = ora({
        text: "✏️ Configuration sumplémenantaire 1/5",
        color: "cyan",
      }).start();
      await new Promise((resolve) => setTimeout(resolve, 2000));
      textnewtropbien.text = "✏️ Configuration sumplémenantaire 2/5";
      await new Promise((resolve) => setTimeout(resolve, 2000));
      textnewtropbien.text = "✏️ Configuration sumplémenantaire 3/5";
      await new Promise((resolve) => setTimeout(resolve, 2000));
      textnewtropbien.text = "✏️ Configuration sumplémenantaire 4/5";
      await new Promise((resolve) => setTimeout(resolve, 2000));
      textnewtropbien.text = "✏️ Configuration sumplémenantaire 5/5";
      await new Promise((resolve) => setTimeout(resolve, 2000));
      textnewtropbien.succeed(chalk.green("🎉 Installation terminée avec succès !"));
      console.log(
        boxen(
          chalk.green.bold("Projet installé avec succès 🎉\n\n") +
            chalk.cyan("Dossier: ") +
            chalk.yellow("wagoo-app"),
          { padding: 1, borderStyle: "round", borderColor: "green" }
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
      process.exit(0);
    } catch (error) {
      console.error("❌ Une erreur s'est produite lors de l'installation.");
      console.error(error);
      rl.close();
      process.exit(1);
    }
  });

program.parse(process.argv);
