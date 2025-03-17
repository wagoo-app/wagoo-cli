#!/usr/bin/env node

import { Command } from "commander";
import { exec, execSync } from "child_process";
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

const program = new Command();
const repo = "https://github.com/wagoo-app/wagoo-app.git";

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
    // console.log("⚠️ wagoo n'est pas installé.");
    return false; // Pas installé
  }

  // console.log("⚠️ wagoo n'est pas installé.");
  return false; // Pas installé
};


// Commande pour installer les dépendances et configurer le projet
// program
//   .command("new")
//   .description("Installer les dépendances et configurer le projet")
//   .action(() => {
//     try {

//       /**
//        * START CLONAGE
//        */
//       const verif = ora({
//         text: "Vérification du répertoire...",
//         color: "cyan"
//       }).start();

//       // Vérifier si le dossier wagoo-app existe déjà
//       const wagooAppDir = path.resolve("wagoo-app");
//       if (fs.existsSync(wagooAppDir)) {
//         verif.fail(chalk.red(
//           "Le dossier 'wagoo-app' existe déjà. Veuillez supprimer ou renommer ce dossier avant de réessayer."
//         ));
//         rl.close();
//         process.exit(1);
//       }

//       // Vérifier si le projet est déjà installé
//       if (checkIfInstalled()) {
//         verif.fail(chalk.red(
//           "Abandon de l'installation, car le projet est déjà installé."
//         ));
//         rl.close();
//         process.exit(1);
//       }

//       const repoPath = "wagoo-app"; // Chemin où le repo doit être cloné
//       const wagooAppPath = path.resolve("wagoo-app"); // Définir le chemin pour wagoo-app
//       const wagooDashAppPath = path.resolve("wagoo-app/dash"); // Définir le chemin pour wagoo-app


//       verif.succeed(chalk.green("Vérification du répertoire... terminée !"));


//       const clonage = ora({
//         text: "📥 Clonage du repository...",
//         color: "cyan"
//       }).start();

//       try {


//         // Décommentez cette ligne pour effectuer le clonage réel si vous avez l'autorisation
//         execSync(`git clone ${repo}`, {
//           stdio: "ignore",
//         });
//         clonage.succeed(chalk.green("📥 Clonage du repository... Terminé !"));
//         /**
//          * END CLONAGE
//          */
//         const dependance = ora({
//           text: "📦 Installation des dépendances... 1/3",
//           color: "cyan"
//         }).start();
//         // Installer les dépendances du projet principal

//         // Changer de répertoire pour installer les dépendances de 'dash'
//         const WagooInstall = path.join(wagooAppPath);
//         process.chdir(WagooInstall);
//         execSync("npm install", { stdio: "ignore" });

//         dependance.text = "📦 Installation des dépendances... 2/3";
//         // const dashPath = path.join(wagooAppPath, "dash");
//         // process.chdir(dashPath);
//         // execSync("npm install", { stdio: "ignore" });
//         execSync("composer install", { stdio: "ignore" });


//         // const desktopApp = path.join(wagooAppPath, "desktop");
//         // process.chdir(desktopApp);
//         // execSync("npm install", { stdio: "ignore" });

//         // Changer de répertoire pour installer les dépendances de 'app_desktop'

//         // Copier le fichier .env
//         dependance.text = "📦 Installation des dépendances... 3/3";

//         // Installer les dépendances du projet statique
//         const staticPath = path.join(wagooAppPath, "static", "v1", "dash");
//         if (fs.existsSync(staticPath)) {
//           process.chdir(staticPath);
//           execSync("npm install", { stdio: "ignore" });
//         } else {
//           dependance.fail(chalk.red(`Le répertoire ${staticPath} n'existe pas.`));
//           process.exit(1);
//         }

//         dependance.succeed(chalk.green("📦 Installation des dépendances... Terminée !"));

//         const config_supp = ora({
//           text: "✏️ Configuration sumplémenantaire... 1/5",
//           color: "cyan"
//         }).start();

//         const configPath = path.join(wagooAppPath, "app", "config");
//         process.chdir(configPath);
//         fs.copyFileSync(".env.example", ".env");

//         // Marquer l'installation comme terminée avec un fichier JSON
//         config_supp.text = "✏️ Configuration sumplémenantaire... 2/3";

//         const wagooDir = path.resolve(wagooAppPath, ".wagoo");
//         if (!fs.existsSync(wagooDir)) {
//           fs.mkdirSync(wagooDir);
//           hidefile.hideSync(wagooDir);
//         }
//         config_supp.text = "✏️ Configuration sumplémenantaire... 3/3";
//         // Configuration pour écrire dans le fichier config.json
//         const config = { status: "installed" };
//         fs.writeFileSync(
//           path.resolve(wagooDir, "check.json"),
//           JSON.stringify(config, null, 2)
//         );

//         config_supp.succeed(chalk.green("✏️ Configuration sumplémenantaire... Terminée !"));

//         console.log(
//           boxen(
//             chalk.green.bold("Projet installé avec succès 🎉\n\n") +

//             chalk.blue("Developped by Wagoo SaaS\n") +
//             chalk.blue("Version : 1.0.0\n") +
//             chalk.blue("Licence : Preline UI Fair & Wagoo System\n") +
//             chalk.blue("How to install : https://github.com/wagoo-app/wagoo-app/install.md\n\n") +
//             chalk.blue("Launch project : \n") +
//             chalk.yellow("$ cd wagoo-app\n") +
//             chalk.yellow("$ wagoo open\n"),
//             { padding: 1, borderStyle: "round", borderColor: "green" }
//           )
//         );

//         rl.close();
//         process.exit(0);
//       } catch (error) {
//         clonage.fail(chalk.red(
//           "Vous n'avez pas la permission de cloner le repository wagoo."
//         ));
//         clonage.fail(chalk.red(error));
//         process.exit(1);
//       }
//     } catch (error) {
//       console.error("❌ Une erreur s'est produite lors de l'installation.");
//       console.error(error);
//       rl.close();
//       process.exit(1);
//     }
//   });


function runCommand(command, loader, successMessage, failureMessage) {
  return new Promise((resolve, reject) => {
    const process = exec(command);

    process.stdout.on("data", (data) => {
      loader.text = `📦 ${data.trim()}`;
    });

    // process.stderr.on("data", (data) => {
    //   console.error(chalk.green(data.trim()));
    // });

    process.on("close", (code) => {
      if (code === 0) {
        loader.succeed(chalk.green(successMessage));
        resolve();
      } else {
        loader.fail(chalk.red(failureMessage));
        reject(new Error(failureMessage));
      }
    });
  });
}

program.command("new").description("Installer les dépendances et configurer le projet").action(async () => {
  try {
    const verif = ora({ text: "📂 Vérification du répertoire...", color: "cyan" }).start();
    const wagooAppDir = path.resolve("wagoo-app");

    if (fs.existsSync(wagooAppDir)) {
      verif.fail(chalk.red("Le dossier 'wagoo-app' existe déjà."));
      process.exit(1);
    }
    // Vérifier si PHP est installé
    if (!checkCommand("php -v")) {
      verif.fail(chalk.red("PHP n'est pas installé. Veuillez installer PHP avant de continuer."));
      process.exit(1);
    }
    else {
      verif.succeed(chalk.green("PHP est installé."));
    }

    // Vérifier si Node.js est installé
    if (!checkCommand("node -v")) {
      verif.fail(chalk.red("Node.js n'est pas installé. Veuillez installer Node.js avant de continuer."));
      process.exit(1);
    }
    else {
      verif.succeed(chalk.green("Node.js est installé."));
    }

    // Vérifier si npm est installé
    if (!checkCommand("npm -v")) {
      verif.fail(chalk.red("npm n'est pas installé. Veuillez installer npm avant de continuer."));
      process.exit(1);
    }
    else {
      verif.succeed(chalk.green("npm est installé."));
    }

    // Installer Composer
    // const installComposer = ora({ text: "📦 Installation de Composer...", color: "cyan" }).start();


    verif.succeed(chalk.green("📂 Vérification du répertoire... terminée !"));

    const clonage = ora({ text: "📥 Clonage du repository...", color: "cyan" }).start();

    try {
      await runCommand(`git clone ${repo}`, clonage, "📥 Clonage terminé !", "Erreur lors du clonage.");
      // await runCommand(`echo>hey.txt`, clonage, "📥 Clonage terminé !", "Erreur lors du clonage.");

      const dependance = ora({ text: "📦 Installation des dépendance... ", color: "cyan" }).start();


      try {
        await runCommand(`cd ${wagooAppDir} && php -r \"copy('https://getcomposer.org/installer', 'composer-setup.php');\"`, dependance, "📦 Téléchargement de Composer... terminée !", "Échec de l'installation de Composer.");
        await runCommand(`cd ${wagooAppDir} && php -r \"if (hash_file('sha384', 'composer-setup.php') === 'dac665fdc30fdd8ec78b38b9800061b4150413ff2e3b6f88543c636f7cd84f6db9189d43a81e5503cda447da73c7e5b6') { echo 'Installer dependanceied'.PHP_EOL; } else { echo 'Installer corrupt'.PHP_EOL; unlink('composer-setup.php'); exit(1); }\"`, dependance, "📦 Check securité de Composer... terminée !", "Échec de l'installation de Composer.");
        await runCommand(`cd ${wagooAppDir} && php composer-setup.php`, dependance, "📦 Installation de Composer... terminée !", "Échec de l'installation de Composer.");
        await runCommand(`cd ${wagooAppDir} && php -r \"unlink('composer-setup.php');\"`, dependance, "📦 Optimisation de Composer... terminée !", "Échec de l'installation de Composer.");

      } catch (error) {
        installComposer.fail(chalk.red("Erreur lors de l'installation de Composer."));
        process.exit(1);
      }


      await runCommand(`cd ${wagooAppDir} && npm install`, dependance, "📦 Dépendances installées !", "Échec de l'installation des dépendances.");

      const dependance2 = ora({ text: "📦 Installation Composer... ", color: "cyan" }).start();
      await runCommand(`cd ${wagooAppDir} && composer install`, dependance2, "📦 Installation Composer réussie !", "Échec de l'installation Composer.");


      const dependance3 = ora({ text: "📦 Installation des dépendances static... ", color: "cyan" }).start();
      const staticPath = path.join(wagooAppDir, "static", "v1", "dash");
      if (fs.existsSync(staticPath)) {
        await runCommand(`cd ${staticPath} && npm install`, dependance3, "📦 Dépendances statiques installées !", "Échec de l'installation des dépendances statiques.");
      } else {
        dependance3.fail(chalk.red(`Le répertoire ${staticPath} n'existe pas.`));
        process.exit(1);
      }

      const config_supp = ora({ text: "✏️ Configuration supplémentaire...", color: "cyan" }).start();
      const configPath = path.join(wagooAppDir, "app", "config");
      fs.copyFileSync(path.join(configPath, ".env.example"), path.join(configPath, ".env"));

      const wagooDir = path.resolve(wagooAppDir, ".wagoo");
      if (!fs.existsSync(wagooDir)) {
        fs.mkdirSync(wagooDir);
        hidefile.hideSync(wagooDir);
      }

      fs.writeFileSync(path.resolve(wagooDir, "check.json"), JSON.stringify({ status: "installed" }, null, 2));


      const wagooConfigPath = path.join(wagooAppDir, ".wagoo-config");

      if (!fs.existsSync(wagooConfigPath)) {
        const defaultConfig = {
          name: "Wagoo",
          link: "https://wagoo.io",
          description: "Wagoo Project",
          version: {
            major: 1,
            minor: 0,
            patch: 0,
            note_version: "New version : 1.0.0"
          }
        };
        fs.writeFileSync(wagooConfigPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
      }

      config_supp.succeed(chalk.green("✏️ Configuration supplémentaire terminée !"));

      const packageJsonPath = path.join(wagooAppDir, ".wagoo-config");



      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const version = `${packageJson.version.major}.${packageJson.version.minor}.${packageJson.version.patch}`;

      console.log(
        boxen(
          chalk.green.bold("Projet installé avec succès 🎉\n\n") +
          chalk.blue("Developped by Wagoo SaaS\n") +
          chalk.blue(`Version : ${version}\n`) +
          chalk.blue("Licence : Preline UI Fair & Wagoo System\n") +
          chalk.blue("How to install and config server : https://github.com/wagoo-app/wagoo-app/install.md\n\n") +
          chalk.blue("Launch project : \n") +
          chalk.yellow("$ cd wagoo-app\n") +
          chalk.yellow("$ wagoo help\n"),
          { padding: 1, borderStyle: "round", borderColor: "green" }
        )
      );

      process.exit(0);
    } catch (error) {
      clonage.fail(chalk.red("Erreur lors de l'installation."));
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
          "npx @tailwindcss/cli -i ./assets/css/input.css -o ./static/v1/dash/css/output.css --watch",
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

      const wagooInConfigPath = path.resolve(".wagoo-config");

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

    const packageJsonPath = path.join(process.cwd(), ".wagoo-config");

    if (!fs.existsSync(packageJsonPath)) {
      const defaultConfig = {
        name: "Wagoo",
        link: "https://wagoo.io",
        description: "Ce projet est un tableau de bord pour gérer les projets de sauvegarde.",
        version: {
          major: 1,
          minor: 0,
          patch: 0,
          note_version: "New version : 1.0.0"
        }
      };
      fs.writeFileSync(packageJsonPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
    }
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const version = `${packageJson.version.major}.${packageJson.version.minor}.${packageJson.version.patch}`;

      console.log(
        boxen(
          `${chalk.cyan.bold(packageJson.name)} ${chalk.green(`v${version}`)}\n\n` +
          `${chalk.blue("Description:")} ${chalk.white(packageJson.description)}\n` +
          `${chalk.blue("Link:")} ${chalk.white(packageJson.link)}\n` +
          `${chalk.blue("Version Note:")} ${chalk.white(packageJson.version.note_version)}`,
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
      const check = path.join(process.cwd());
      if (!fs.existsSync(check)) {
        console.error(
          "❌ Cette commande ne fonctionne que dans un dossier du projet."
        );
        process.exit(1);
      }

      const configPath = path.resolve(".wagoo", "check.json");

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

      const packageJsonPath = path.join(process.cwd(), ".wagoo-config");

      if (!fs.existsSync(packageJsonPath)) {
        const defaultConfig = {
          name: "Wagoo",
          link: "https://wagoo.io",
          description: "Ce projet est un tableau de bord pour gérer les projets de sauvegarde.",
          version: {
            major: 1,
            minor: 0,
            patch: 0,
            note_version: "New version : 1.0.0"
          }
        };
        fs.writeFileSync(packageJsonPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
      }

      const WagooConfigPath = path.resolve(".wagoo-config");

      const ConfigWagoo = fs.readFileSync(WagooConfigPath, "utf-8");
      const wagooconfig = JSON.parse(ConfigWagoo);

      // Incrémentation du patch
      wagooconfig.version.patch += 1;
      const newVersion = `${wagooconfig.version.major}.${wagooconfig.version.minor}.${wagooconfig.version.patch}`;

      console.log(`🚀 Nouvelle version : ${newVersion}`);

      // Écrire la mise à jour dans le fichier config.json
      fs.writeFileSync(WagooConfigPath, JSON.stringify(wagooconfig, null, 2), "utf-8");
      console.log("✅ .wagoo-config mis à jour avec succès.");

      // Ajouter, commit et push sur GitHub
      try {
        execSync("git add .", { stdio: "ignore" });
        execSync(`git commit -m "New version : ${newVersion}"`, {
          stdio: "ignore",
        });
        execSync("git push", { stdio: "ignore" });

        console.log("🚀 Patch créé et poussé sur GitHub avec succès !");
        rl.close();
        process.exit(1);
      } catch (error) {
        console.error("❌ Erreur lors du commit/push Git :", error.message);
        rl.close();
        process.exit(1);
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
        color: "cyan"
      }).start();
      await new Promise((resolve) => setTimeout(resolve, 100));
      clonage.text = "📥 Clonage du repository...";
      await new Promise((resolve) => setTimeout(resolve, 100));
      clonage.succeed(chalk.green("🎉 Installation terminée avec succès !"));

      await new Promise((resolve) => setTimeout(resolve, 100));

      const dependance = ora({
        text: "📦 Installation des dépendances 1/3",
        color: "cyan",
      }).start();
      await new Promise((resolve) => setTimeout(resolve, 100));
      dependance.text = "📦 Installation des dépendances 2/3";
      await new Promise((resolve) => setTimeout(resolve, 100));
      dependance.text = "📦 Installation des dépendances 3/3";
      await new Promise((resolve) => setTimeout(resolve, 100));
      dependance.succeed(
        chalk.green("📦 Installation des dépendances : Termnier")
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      const textnewtropbien = ora({
        text: "✏️ Configuration sumplémenantaire 1/5",
        color: "cyan",
      }).start();
      await new Promise((resolve) => setTimeout(resolve, 100));
      textnewtropbien.text = "✏️ Configuration sumplémenantaire 2/5";
      await new Promise((resolve) => setTimeout(resolve, 100));
      textnewtropbien.text = "✏️ Configuration sumplémenantaire 3/5";
      await new Promise((resolve) => setTimeout(resolve, 100));
      textnewtropbien.text = "✏️ Configuration sumplémenantaire 4/5";
      await new Promise((resolve) => setTimeout(resolve, 100));
      textnewtropbien.text = "✏️ Configuration sumplémenantaire 5/5";
      await new Promise((resolve) => setTimeout(resolve, 100));
      textnewtropbien.succeed(chalk.green("🎉 Installation terminée avec succès !"));
      console.log(
        boxen(
          chalk.green.bold("Projet installé avec succès 🎉\n\n") +

          chalk.blue("Developped by Wagoo SaaS\n") +
          chalk.blue("Version : 1.0.0\n") +
          chalk.blue("Licence : Preline UI Fair & Wagoo System\n") +
          chalk.blue("How to install : https://github.com/wagoo-app/wagoo-app/install.md\n\n") +
          chalk.blue("Launch project : \n") +
          chalk.yellow("$ cd wagoo-app\n") +
          chalk.yellow("$ wagoo open\n"),
          // chalk.yellow("Open browser : $ wagoo link\n") +
          // chalk.yellow("Start Tailwindcss : $ wagoo css\n") +
          // chalk.yellow("Build Tailwindcss : $ wagoo build css\n") +
          // chalk.yellow("Start Desktop Electron.Js App : $ wagoo desktop\n") +
          // chalk.yellow("Build Desktop Electron.Js App : $ wagoo build desktop\n") +
          // chalk.yellow("Push to github : $ wagoo push\n") +
          { padding: 1, borderStyle: "round", borderColor: "green" }
        )
      );

      rl.close();
      process.exit(0);
    } catch (error) {
      console.error("❌ Une erreur s'est produite lors de l'installation.");
      console.error(error);
      rl.close();
      process.exit(1);
    }
  });


program.parse(process.argv);