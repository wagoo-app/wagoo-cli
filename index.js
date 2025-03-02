#!/usr/bin/env node

import { Command } from "commander";
import { execSync } from "child_process";
import fs from "fs";
import readline from "readline";
import { fileURLToPath } from "url";
import path from "path";
import hidefile from "hidefile";

const program = new Command();

// Créer l'interface pour l'entrée utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Fonction pour vérifier si une commande est disponible
const checkCommand = (cmd) => {
  try {
    execSync(cmd, { stdio: "inherit" });
    return true;
  } catch {
    return false;
  }
};

// Vérifier si l'installation a déjà été effectuée
const checkIfInstalled = () => {
  const wagooConfigPath = path.resolve("wagoo-app", ".wagoo", "config.json");
  const wagooInConfigPath = path.resolve(".wagoo", "config.json");

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

      console.log("📥 Clonage du repository...");
      try {
        // Décommentez cette ligne pour effectuer le clonage réel si vous avez l'autorisation
        execSync("git clone https://github.com/leo-lb29/wagoo-app.git", {
          stdio: "inherit",
        });
        console.log("✅ Repo 'wagoo-app' cloné avec succès.");

        // Installer les dépendances du projet principal
        console.log("📦 Installation des dépendances...");

        // Changer de répertoire pour installer les dépendances de 'dash'
        const WagooInstall = path.join(wagooAppPath);
        process.chdir(WagooInstall);
        execSync("npm install", { stdio: "inherit" });

        const dashPath = path.join(wagooAppPath, "dash");
        process.chdir(dashPath);
        execSync("npm install", { stdio: "inherit" });
        execSync("composer install", { stdio: "inherit" });

        // const desktopApp = path.join(wagooAppPath, "desktop");
        // process.chdir(desktopApp);
        // execSync("npm install", { stdio: "inherit" });

        // Changer de répertoire pour installer les dépendances de 'app_desktop'

        // Copier le fichier .env
        const configPath = path.join(wagooAppPath, "dash", "app", "config");
        process.chdir(configPath);
        fs.copyFileSync(".env.example", ".env");

        // Installer les dépendances du projet statique
        console.log(" Installation des dépendances du projet statique...");
        const staticPath = path.join(wagooAppPath, "static", "v1", "dash");
        if (fs.existsSync(staticPath)) {
          process.chdir(staticPath);
          execSync("npm install", { stdio: "inherit" });
        } else {
          console.error(`❌ Le répertoire ${staticPath} n'existe pas.`);
          process.exit(1);
        }

        // Marquer l'installation comme terminée avec un fichier JSON

        const wagooDir = path.resolve(wagooAppPath, ".wagoo");
        if (!fs.existsSync(wagooDir)) {
          fs.mkdirSync(wagooDir);
          hidefile.hideSync(wagooDir);
        }
        // Configuration pour écrire dans le fichier config.json
        const config = { status: "installed" };
        fs.writeFileSync(
          path.resolve(wagooDir, "config.json"),
          JSON.stringify(config, null, 2)
        );

        // Marquer l'installation comme terminée avec un fichier JSON

        const dashDir = path.resolve(wagooDashAppPath, ".dash");
        if (!fs.existsSync(dashDir)) {
          fs.mkdirSync(dashDir);
          hidefile.hideSync(dashDir);
        }
        // Configuration pour écrire dans le fichier config.json
        const configDash = { status: "installed" };
        fs.writeFileSync(
          path.resolve(dashDir, "config.json"),
          JSON.stringify(configDash, null, 2)
        );

        console.log("🎉 Installation terminée!");

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
        execSync("git add .", { stdio: "inherit" });
        execSync('git commit -m "Push from wagoo-cli"', { stdio: "inherit" });
        execSync("git push", { stdio: "inherit" });
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
          "npx tailwindcss -i ./dash/assets/css/input.css -o ./static/v1/dash/css/output.css --watch",
          { stdio: "inherit" }
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
        execSync("npm run build", { stdio: "inherit" });
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
        execSync('"Wagoo SAAS.code-workspace"', { stdio: "inherit" });
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

program.parse(process.argv);
