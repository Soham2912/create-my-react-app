#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import inquirer from 'inquirer';
import figlet from 'figlet';

class ReactProjectGenerator {
  constructor() {
    this.projectTemplates = {
      basic: {
        dependencies: {
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'react-scripts': '^5.0.1'
        },
        devDependencies: {
          '@testing-library/react': '^13.3.0',
          'eslint': '^8.20.0',
          'prettier': '^2.7.1'
        }
      },
      'with-router': {
        dependencies: {
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'react-scripts': '^5.0.1',
          'react-router-dom': '^6.3.0'
        },
        devDependencies: {
          '@testing-library/react': '^13.3.0',
          'eslint': '^8.20.0',
          'prettier': '^2.7.1'
        }
      }
    };
  }

  async createProject() {
    // Welcome message
    console.log(
      chalk.blue(
        figlet.textSync('create-my-react-app', { 
          font: 'standard', 
          horizontalLayout: 'default' 
        })
      )
    );

    // Collect project details
    const { projectName, templateType } = await this.promptProjectDetails();

    // Validate project name
    if (!projectName) {
      console.error(chalk.red('Please provide a project name'));
      process.exit(1);
    }

    const projectPath = path.resolve(projectName);

    try {
      // Create project directory
      fs.mkdirpSync(projectPath);

      // Create project structure
      this.createProjectStructure(projectPath, templateType);

      // Create package.json
      this.createPackageJson(projectPath, projectName, templateType);

      // Change to project directory
      process.chdir(projectPath);

      // Install dependencies
      this.installDependencies(templateType);

      // Initialize git repository
     // this.initializeGitRepository();

      // Success message
      this.displaySuccessMessage(projectName);

    } catch (err) {
      console.error(chalk.red(`Project creation failed: ${err.message}`));
      process.exit(1);
    }
  }

  async promptProjectDetails() {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project Name:',
        validate: (input) => {
          // Validate project name
          const validNameRegex = /^[a-z0-9-]+$/;
          return validNameRegex.test(input) 
            ? true 
            : 'Project name must be lowercase, alphanumeric with hyphens';
        }
      }, 
      {
        type: 'list',
        name: 'templateType',
        message: 'Select Project Template:',
        choices: ['basic', 'with-router']
      }
    ]);
  }

  createProjectStructure(projectPath, templateType) {
    const projectStructure = {
      'public': ['index.html', 'favicon.ico', 'manifest.json'],
      'src': [
        'App.js', 
        'index.js', 
        'index.css', 
        'App.css',
        ...(templateType === 'with-router' ? ['components/Home.js', 'components/About.js'] : [])
      ]
    };

    // Create directories
    Object.keys(projectStructure).forEach(dir => {
      const dirPath = path.join(projectPath, dir);
      fs.mkdirpSync(dirPath);

      // Create files in each directory
      projectStructure[dir].forEach(file => {
        const filePath = path.join(dirPath, file);
        fs.writeFileSync(filePath, this.getTemplateContent(file, templateType));
      });
    });
  }

  createPackageJson(projectPath, projectName, templateType) {
    const templateConfig = this.projectTemplates[templateType];
    
    const packageJson = {
      name: projectName,
      version: '0.1.0',
      private: true,
      type: 'module',
      dependencies: templateConfig.dependencies,
      devDependencies: templateConfig.devDependencies,
      scripts: {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test',
        eject: 'react-scripts eject'
      }
    };

    fs.writeFileSync(
      path.join(projectPath, 'package.json'), 
      JSON.stringify(packageJson, null, 2)
    );
  }

  installDependencies() {
    console.log(chalk.blue('Installing dependencies...'));
    try {
      execSync('npm install', { stdio: 'inherit' });
    } catch (err) {
      console.error(chalk.red(`Dependency installation failed: ${err.message}`));
      process.exit(1);
    }
  }

  initializeGitRepository() {
    try {
      execSync('git init', { stdio: 'inherit' });
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
      console.log(chalk.green('Git repository initialized'));
    } catch (err) {
      console.warn(chalk.yellow('Git initialization failed'));
    }
  }

  displaySuccessMessage(projectName) {
    console.log(chalk.green(`
✨ Project ${projectName} created successfully!

Next steps:
- cd ${projectName}
- npm start

Happy Coding! 🚀`));
  }

  getTemplateContent(filename, templateType) {
    const templates = {
      'index.html': `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
      'App.js': templateType === 'with-router' 
        ? `
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home.js';
import About from './components/About.js';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;`
        : `
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Welcome to My React App</h1>
    </div>
  );
}

export default App;`,
      'index.js': `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      'index.css': `
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto';
}`,
      'components/Home.js': `
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <Link to="/about">Go to About</Link>
    </div>
  );
}

export default Home;`,
      'components/About.js': `
import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div>
      <h1>About Page</h1>
      <Link to="/">Go to Home</Link>
    </div>
  );
}`
    };

    return templates[filename] || '';
  }
}


async function main() {
  const generator = new ReactProjectGenerator();
  
  try {
    await generator.createProject();
  } catch (error) {
    console.error('Project generation failed:', error);
    process.exit(1);
  }
}

main();