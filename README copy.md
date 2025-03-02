# baxoo-cli

```js
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
    execSync(cmd, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

// Vérifier si l'installation a déjà été effectuée
const checkIfInstalled = () => {
  const baxooConfigPath = path.resolve("baxoo-app", ".baxoo", "config.json");
  const baxooInConfigPath = path.resolve(".baxoo", "config.json");

  if (fs.existsSync(baxooConfigPath)) {
    const configContent = fs.readFileSync(baxooConfigPath, "utf-8");
    const config = JSON.parse(configContent);
    if (config.status === "installed") {
      console.log("⚠️ Le projet est déjà installé.");
      return true;
    }
  }
  else if (fs.existsSync(baxooInConfigPath)) {
    const configContent = fs.readFileSync(baxooInConfigPath, "utf-8");
    const config = JSON.parse(configContent);
    if (config.status === "installed") {
      console.log("⚠️ Le projet est déjà installé.");
      return true;
    }
  }
  return false;
};

// Commande pour installer les dépendances et configurer le projet
program
  .command("new")
  .description("Installer les dépendances et configurer le projet")
  .action(() => {
    try {
      // Vérifier si le projet est déjà installé
      if (checkIfInstalled()) {
        console.log("❌ Abandon de l'installation, car le projet est déjà installé.");
        rl.close();
        process.exit(1);
      }

      const repoPath = "baxoo-app"; // Chemin où le repo doit être cloné
      const baxooAppPath = path.resolve("baxoo-app"); // Définir le chemin pour baxoo-app

      console.log("📥 Clonage du repository...");
      try {
        // Décommentez cette ligne pour effectuer le clonage réel si vous avez l'autorisation
        execSync("git clone https://github.com/leo-lb29/baxoo-app.git", {
          stdio: "inherit",
        });
        console.log("✅ Repo 'baxoo-app' cloné avec succès.");

        // Installer les dépendances du projet principal
        console.log("📦 Installation des dépendances...");

        // Changer de répertoire pour installer les dépendances de 'dash'
        const dashPath = path.join(baxooAppPath, "dash");
        process.chdir(dashPath);
        execSync("npm install", { stdio: "ignore" });
        execSync("composer install", { stdio: "ignore" });

        // Changer de répertoire pour installer les dépendances de 'app_desktop'
        const appDesktopPath = path.join(baxooAppPath, "app_desktop");
        process.chdir(appDesktopPath);
        execSync("npm install", { stdio: "ignore" });

        // Copier le fichier .env
        const configPath = path.join(baxooAppPath, "dash", "allcode", "config");
        process.chdir(configPath);
        fs.copyFileSync(".env.example", ".env");

        // Installer les dépendances du projet statique
        console.log(" Installation des dépendances du projet statique...");
        const staticPath = path.join(baxooAppPath, "static", "v1", "dash");
        if (fs.existsSync(staticPath)) {
          process.chdir(staticPath);
          execSync("npm install", { stdio: "ignore" });
        } else {
          console.error(`❌ Le répertoire ${staticPath} n'existe pas.`);
          process.exit(1);
        }

        // Marquer l'installation comme terminée avec un fichier JSON

        const baxooDir = path.resolve(baxooAppPath, ".baxoo");
        if (!fs.existsSync(baxooDir)) {
          fs.mkdirSync(baxooDir);
          hidefile.hideSync(baxooDir);
        }
        // Configuration pour écrire dans le fichier config.json
        const config = { status: "installed" };
        fs.writeFileSync(path.resolve(baxooDir, "config.json"), JSON.stringify(config, null, 2));

        console.log("🎉 Installation terminée!");

        rl.close();
        process.exit(0);
      } catch (error) {
        console.error("❌ Vous n'avez pas la permission de cloner le repository Baxoo.");
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

program.parse(process.argv);


```