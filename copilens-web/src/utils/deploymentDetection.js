/**
 * Deployment Detection Utility
 * Analyzes repository structure to detect deployment platform configurations
 */

export function detectDeploymentOptions(fileTree, fileContents, languages, packageJson) {
  const files = Array.isArray(fileTree) ? fileTree : flattenTree(fileTree);
  const filePaths = files.map(f => f.path?.toLowerCase() || '');
  
  const deploymentOptions = {
    vercel: detectVercel(filePaths, fileContents, packageJson, languages),
    netlify: detectNetlify(filePaths, fileContents, languages),
    railway: detectRailway(filePaths, fileContents, languages),
    heroku: detectHeroku(filePaths, fileContents, languages),
    render: detectRender(filePaths, fileContents, languages),
    docker: detectDocker(filePaths, fileContents)
  };

  return deploymentOptions;
}

function flattenTree(tree, result = []) {
  if (Array.isArray(tree)) {
    tree.forEach(node => flattenTree(node, result));
  } else if (tree && typeof tree === 'object') {
    if (tree.path) result.push(tree);
    if (tree.children) flattenTree(tree.children, result);
  }
  return result;
}

function detectVercel(filePaths, fileContents, packageJson, languages) {
  const hasVercelJson = filePaths.some(p => p === 'vercel.json');
  const hasNextConfig = filePaths.some(p => 
    p === 'next.config.js' || p === 'next.config.mjs' || p === 'next.config.ts'
  );
  
  let hasNextDep = false;
  let hasReactDep = false;
  
  if (packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    hasNextDep = 'next' in deps;
    hasReactDep = 'react' in deps;
  }

  const isJSProject = languages.JavaScript || languages.TypeScript;
  const available = hasVercelJson || hasNextConfig || hasNextDep;

  return {
    available,
    confidence: available ? 95 : (isJSProject && hasReactDep) ? 60 : 30,
    detectedFiles: [
      hasVercelJson && 'vercel.json',
      hasNextConfig && 'next.config.js',
    ].filter(Boolean),
    requiredFiles: available ? [] : ['vercel.json (optional)'],
    setupInstructions: available 
      ? 'Your repository is ready for Vercel deployment. Click "Deploy Now" to connect your GitHub repository.'
      : 'To deploy to Vercel:\n1. Create a vercel.json config file (optional for Next.js)\n2. Connect your GitHub repository at vercel.com\n3. Configure build settings if needed',
    buildCommand: packageJson?.scripts?.build || 'npm run build',
    installCommand: 'npm install',
    framework: hasNextDep ? 'Next.js' : hasReactDep ? 'React' : 'Node.js',
    docsUrl: 'https://vercel.com/docs'
  };
}

function detectNetlify(filePaths, fileContents, languages) {
  const hasNetlifyToml = filePaths.some(p => p === 'netlify.toml');
  const hasNetlifyJson = filePaths.some(p => p === 'netlify.json');
  const hasRedirects = filePaths.some(p => p === '_redirects' || p === 'public/_redirects');
  const hasHeaders = filePaths.some(p => p === '_headers' || p === 'public/_headers');
  
  const available = hasNetlifyToml || hasNetlifyJson || hasRedirects || hasHeaders;
  const isStaticSite = languages.HTML || languages.CSS;

  return {
    available,
    confidence: available ? 90 : isStaticSite ? 70 : 40,
    detectedFiles: [
      hasNetlifyToml && 'netlify.toml',
      hasNetlifyJson && 'netlify.json',
      hasRedirects && '_redirects',
      hasHeaders && '_headers'
    ].filter(Boolean),
    requiredFiles: available ? [] : ['netlify.toml (recommended)'],
    setupInstructions: available
      ? 'Your repository has Netlify configuration. Click "Deploy Now" to connect via GitHub.'
      : 'To deploy to Netlify:\n1. Create netlify.toml configuration\n2. Add build settings\n3. Connect repository at app.netlify.com',
    buildCommand: 'npm run build',
    publishDirectory: 'dist',
    docsUrl: 'https://docs.netlify.com'
  };
}

function detectRailway(filePaths, fileContents, languages) {
  const hasRailwayJson = filePaths.some(p => p === 'railway.json');
  const hasRailwayToml = filePaths.some(p => p === 'railway.toml');
  const hasDockerfile = filePaths.some(p => p === 'dockerfile' || p.endsWith('dockerfile'));
  
  const available = hasRailwayJson || hasRailwayToml;
  const hasBackendLang = languages.Python || languages.Go || languages.Java || languages.Ruby;

  return {
    available,
    confidence: available ? 95 : hasDockerfile ? 75 : hasBackendLang ? 60 : 30,
    detectedFiles: [
      hasRailwayJson && 'railway.json',
      hasRailwayToml && 'railway.toml',
      hasDockerfile && 'Dockerfile'
    ].filter(Boolean),
    requiredFiles: available ? [] : ['railway.json or Dockerfile'],
    setupInstructions: available
      ? 'Railway configuration detected. Deploy directly from GitHub repository.'
      : 'To deploy to Railway:\n1. Add railway.json or Dockerfile\n2. Configure start command\n3. Connect at railway.app',
    framework: detectFramework(languages),
    docsUrl: 'https://docs.railway.app'
  };
}

function detectHeroku(filePaths, fileContents, languages) {
  const hasProcfile = filePaths.some(p => p === 'procfile');
  const hasAppJson = filePaths.some(p => p === 'app.json');
  const hasHerokuYml = filePaths.some(p => p === 'heroku.yml');
  
  const available = hasProcfile || hasAppJson || hasHerokuYml;

  return {
    available,
    confidence: available ? 95 : 50,
    detectedFiles: [
      hasProcfile && 'Procfile',
      hasAppJson && 'app.json',
      hasHerokuYml && 'heroku.yml'
    ].filter(Boolean),
    requiredFiles: available ? [] : ['Procfile (required)'],
    setupInstructions: available
      ? 'Heroku configuration found. Use Heroku CLI or connect via GitHub.'
      : 'To deploy to Heroku:\n1. Create a Procfile with start command\n2. Add app.json for metadata (optional)\n3. Use Heroku CLI or GitHub integration',
    buildCommand: 'npm install',
    startCommand: 'npm start',
    docsUrl: 'https://devcenter.heroku.com'
  };
}

function detectRender(filePaths, fileContents, languages) {
  const hasRenderYaml = filePaths.some(p => p === 'render.yaml');
  const hasDockerfile = filePaths.some(p => p === 'dockerfile' || p.endsWith('dockerfile'));
  
  const available = hasRenderYaml;

  return {
    available,
    confidence: available ? 95 : hasDockerfile ? 60 : 40,
    detectedFiles: [
      hasRenderYaml && 'render.yaml',
      hasDockerfile && 'Dockerfile'
    ].filter(Boolean),
    requiredFiles: available ? [] : ['render.yaml (recommended)'],
    setupInstructions: available
      ? 'Render configuration detected. Connect your repository at render.com.'
      : 'To deploy to Render:\n1. Create render.yaml with service definitions\n2. Configure build and start commands\n3. Connect at render.com',
    framework: detectFramework(languages),
    docsUrl: 'https://render.com/docs'
  };
}

function detectDocker(filePaths, fileContents) {
  const hasDockerfile = filePaths.some(p => p === 'dockerfile' || p.endsWith('dockerfile'));
  const hasDockerCompose = filePaths.some(p => 
    p === 'docker-compose.yml' || p === 'docker-compose.yaml'
  );
  const hasDockerignore = filePaths.some(p => p === '.dockerignore');
  
  const available = hasDockerfile;

  return {
    available,
    confidence: available ? 100 : 0,
    detectedFiles: [
      hasDockerfile && 'Dockerfile',
      hasDockerCompose && 'docker-compose.yml',
      hasDockerignore && '.dockerignore'
    ].filter(Boolean),
    requiredFiles: available ? [] : ['Dockerfile'],
    setupInstructions: available
      ? 'Docker configuration found. You can deploy to any container platform (AWS ECS, Google Cloud Run, Azure Container Apps, DigitalOcean, etc.)'
      : 'Create a Dockerfile to enable containerized deployment to any cloud platform.',
    docsUrl: 'https://docs.docker.com'
  };
}

function detectFramework(languages) {
  if (languages.JavaScript || languages.TypeScript) return 'Node.js';
  if (languages.Python) return 'Python';
  if (languages.Go) return 'Go';
  if (languages.Java) return 'Java';
  if (languages.Ruby) return 'Ruby';
  if (languages.PHP) return 'PHP';
  if (languages['C#']) return '.NET';
  return 'Unknown';
}

export function getDeploymentPriority(deploymentOptions) {
  const platforms = Object.entries(deploymentOptions)
    .filter(([_, config]) => config.available)
    .map(([platform, config]) => ({ platform, ...config }))
    .sort((a, b) => b.confidence - a.confidence);
  
  return platforms;
}

export function getRecommendedPlatform(deploymentOptions, languages) {
  const available = getDeploymentPriority(deploymentOptions);
  
  if (available.length > 0) {
    return available[0].platform;
  }
  
  // Fallback recommendations based on language
  if (languages.JavaScript || languages.TypeScript) return 'vercel';
  if (languages.Python) return 'railway';
  if (languages.HTML || languages.CSS) return 'netlify';
  
  return 'docker';
}
