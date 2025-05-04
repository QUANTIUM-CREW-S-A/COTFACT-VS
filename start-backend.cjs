/**
 * Script para iniciar el backend automáticamente
 * Intenta iniciar el servidor en los puertos disponibles y muestra información de diagnóstico
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');

// Configuración
const ports = [3001, 3000, 3002, 5000, 8000];
const backendDir = path.join(__dirname, 'backend');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m'
  }
};

// Función para verificar si hay un proceso en un puerto
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    
    server.listen(port);
  });
}

// Función para probar conexión a URL
function testConnection(url, path = '/health') {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve({ connected: false, error: 'Timeout' });
    }, 3000);
    
    http.get(`${url}${path}`, (res) => {
      clearTimeout(timeoutId);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ connected: res.statusCode === 200, data: jsonData });
        } catch (e) {
          resolve({ connected: res.statusCode === 200, data });
        }
      });
    }).on('error', (err) => {
      clearTimeout(timeoutId);
      resolve({ connected: false, error: err.message });
    });
  });
}

// Función para mostrar información de diagnóstico
async function showDiagnosticInfo() {
  console.log(`${colors.fg.cyan}${colors.bright}=== Información de diagnóstico ====${colors.reset}`);
  console.log(`${colors.fg.yellow}Sistema operativo:${colors.reset} ${os.platform()} ${os.release()}`);
  console.log(`${colors.fg.yellow}Memoria disponible:${colors.reset} ${Math.round(os.freemem() / 1024 / 1024)} MB / ${Math.round(os.totalmem() / 1024 / 1024)} MB`);
  console.log(`${colors.fg.yellow}Node.js:${colors.reset} ${process.version}`);
  
  // Verificar archivos importantes
  console.log(`\n${colors.fg.cyan}Verificando archivos importantes:${colors.reset}`);
  
  const filesToCheck = [
    { path: path.join(backendDir, 'package.json'), name: 'Backend package.json' },
    { path: path.join(backendDir, 'src/app.ts'), name: 'Backend app.ts' },
    { path: path.join(backendDir, 'src/db/connection.ts'), name: 'DB connection' },
    { path: path.join(backendDir, '.env'), name: 'Backend .env' }
  ];
  
  filesToCheck.forEach(file => {
    if (fs.existsSync(file.path)) {
      console.log(`${colors.fg.green}✓ ${file.name}${colors.reset}`);
    } else {
      console.log(`${colors.fg.red}✗ ${file.name}${colors.reset}`);
    }
  });
  
  // Verificar variables de entorno
  console.log(`\n${colors.fg.cyan}Variables de entorno importantes:${colors.reset}`);
  const envPath = path.join(backendDir, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      console.log(`${colors.fg.green}✓ Archivo .env encontrado con ${envVars.length} variables${colors.reset}`);
      // Comprobar variables críticas
      const criticalVars = ['PORT', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
      criticalVars.forEach(varName => {
        if (envContent.includes(varName + '=')) {
          console.log(`  ${colors.fg.green}✓ ${varName}${colors.reset}`);
        } else {
          console.log(`  ${colors.fg.red}✗ ${varName} no encontrada${colors.reset}`);
        }
      });
    } catch (err) {
      console.log(`${colors.fg.red}✗ Error leyendo .env: ${err.message}${colors.reset}`);
    }
  } else {
    console.log(`${colors.fg.red}✗ Archivo .env no encontrado${colors.reset}`);
  }
  
  // Verificar servicios
  console.log(`\n${colors.fg.cyan}Verificando servicios:${colors.reset}`);
  
  // Prueba de conexión a Supabase
  console.log(`${colors.fg.yellow}Probando conexión a Supabase...${colors.reset}`);
  try {
    const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    const supabaseUrlMatch = envContent.match(/SUPABASE_URL=(.+)/);
    
    if (supabaseUrlMatch && supabaseUrlMatch[1]) {
      const supabaseUrl = supabaseUrlMatch[1];
      const healthUrl = supabaseUrl.replace('https://', 'https://') + '/rest/v1/';
      
      console.log(`${colors.fg.yellow}URL de Supabase:${colors.reset} ${supabaseUrl}`);
      
      const { connected, error } = await testConnection(healthUrl);
      
      if (connected) {
        console.log(`${colors.fg.green}✓ Supabase parece estar accesible${colors.reset}`);
      } else {
        console.log(`${colors.fg.red}✗ No se pudo conectar a Supabase: ${error}${colors.reset}`);
      }
    } else {
      console.log(`${colors.fg.red}✗ No se encontró URL de Supabase en el archivo .env${colors.reset}`);
    }
  } catch (err) {
    console.log(`${colors.fg.red}✗ Error verificando Supabase: ${err.message}${colors.reset}`);
  }
  
  // Verificar puertos en uso
  console.log(`\n${colors.fg.cyan}Verificando puertos disponibles:${colors.reset}`);
  for (const port of ports) {
    const inUse = await isPortInUse(port);
    console.log(`Puerto ${port}: ${inUse ? 
      colors.fg.yellow + 'En uso' + colors.reset : 
      colors.fg.green + 'Disponible' + colors.reset}`);
  }
}

// Función principal para iniciar el backend
async function startBackend() {
  console.log(`${colors.bg.blue}${colors.fg.white}${colors.bright} COTFACT-VS Backend Starter ${colors.reset}\n`);
  
  // Verificar si estamos en el directorio correcto
  if (!fs.existsSync(backendDir)) {
    console.error(`${colors.fg.red}Error: No se encontró el directorio del backend en ${backendDir}${colors.reset}`);
    process.exit(1);
  }
  
  // Mostrar información de diagnóstico
  await showDiagnosticInfo();
  
  // Verificar si ya hay un servidor backend funcionando
  for (const port of ports) {
    try {
      const url = `http://localhost:${port}`;
      const { connected, data } = await testConnection(url);
      
      if (connected) {
        console.log(`\n${colors.bg.green}${colors.fg.black}${colors.bright} ¡SERVIDOR BACKEND YA ESTÁ ACTIVO! ${colors.reset}`);
        console.log(`${colors.fg.green}✓ El servidor ya está ejecutándose en ${url}${colors.reset}`);
        
        if (data && typeof data === 'object') {
          console.log(`${colors.fg.green}✓ Respuesta del servidor: ${JSON.stringify(data, null, 2)}${colors.reset}`);
        }
        
        console.log(`\n${colors.fg.cyan}No es necesario iniciar un nuevo servidor.${colors.reset}`);
        console.log(`${colors.fg.cyan}Para usar este servidor existente, puedes acceder a:${colors.reset}`);
        console.log(`${colors.bg.green}${colors.fg.black}${colors.bright} URL: ${url}/health ${colors.reset}\n`);
        
        process.exit(0);
      }
    } catch (err) {
      // Ignoramos errores - simplemente significa que no hay servidor en ese puerto
    }
  }
  
  // Probar puertos disponibles
  console.log(`\n${colors.fg.cyan}Buscando puerto disponible para el servidor...${colors.reset}`);
  
  let availablePort = null;
  
  for (const port of ports) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      console.log(`${colors.fg.green}✓ Puerto ${port} disponible${colors.reset}`);
      availablePort = port;
      break;
    } else {
      console.log(`${colors.fg.yellow}✗ Puerto ${port} ocupado${colors.reset}`);
    }
  }
  
  if (!availablePort) {
    console.error(`${colors.fg.red}Error: No se encontró un puerto disponible. Intente cerrar otras aplicaciones.${colors.reset}`);
    process.exit(1);
  }
  
  // Actualizar el archivo .env con el puerto disponible
  try {
    const envPath = path.join(backendDir, '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Actualizar o agregar la variable PORT
      if (envContent.includes('\nPORT=')) {
        envContent = envContent.replace(/\nPORT=\d+/, `\nPORT=${availablePort}`);
      } else if (envContent.includes('PORT=')) {
        envContent = envContent.replace(/PORT=\d+/, `PORT=${availablePort}`);
      } else {
        envContent += `\nPORT=${availablePort}`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log(`${colors.fg.green}✓ Archivo .env actualizado con PORT=${availablePort}${colors.reset}`);
    } else {
      console.log(`${colors.fg.yellow}! Archivo .env no encontrado. Se usará PORT=${availablePort} como variable de entorno.${colors.reset}`);
    }
  } catch (err) {
    console.log(`${colors.fg.yellow}! Error actualizando .env: ${err.message}. Se continuará de todos modos.${colors.reset}`);
  }
  
  // Comprobar si es necesario instalar dependencias
  const nodeModulesPath = path.join(backendDir, 'node_modules');
  const packageLockPath = path.join(backendDir, 'package-lock.json');
  const yarnLockPath = path.join(backendDir, 'yarn.lock');
  
  if (!fs.existsSync(nodeModulesPath) || 
      !fs.existsSync(packageLockPath) && !fs.existsSync(yarnLockPath)) {
    console.log(`\n${colors.fg.cyan}Instalando dependencias del backend...${colors.reset}`);
    
    // Determinar el comando según el sistema operativo
    const isWindows = os.platform() === 'win32';
    const npmCmd = isWindows ? 'npm.cmd' : 'npm';
    
    // Ejecutar npm install
    const installProcess = spawn(npmCmd, ['install'], { 
      cwd: backendDir,
      stdio: 'inherit'
    });
    
    await new Promise((resolve) => {
      installProcess.on('close', (code) => {
        if (code !== 0) {
          console.log(`${colors.fg.yellow}! La instalación de dependencias terminó con código ${code}${colors.reset}`);
        } else {
          console.log(`${colors.fg.green}✓ Dependencias instaladas correctamente${colors.reset}`);
        }
        resolve();
      });
    });
  }
  
  // Iniciar el servidor
  console.log(`\n${colors.fg.cyan}${colors.bright}Iniciando el servidor backend en el puerto ${availablePort}...${colors.reset}`);
  
  // Determinar el comando según el sistema operativo
  const isWindows = os.platform() === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';
  
  // Iniciar con npm run dev
  const serverProcess = spawn(npmCmd, ['run', 'dev'], { 
    cwd: backendDir,
    env: { ...process.env, PORT: availablePort.toString() }
  });
  
  serverProcess.stdout.on('data', (data) => {
    console.log(`${colors.fg.green}${data.toString().trim()}${colors.reset}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(`${colors.fg.red}${data.toString().trim()}${colors.reset}`);
  });
  
  serverProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`${colors.fg.red}${colors.bright}El servidor se detuvo con código ${code}${colors.reset}`);
    } else {
      console.log(`${colors.fg.yellow}El servidor se detuvo normalmente${colors.reset}`);
    }
  });
  
  console.log(`\n${colors.fg.cyan}${colors.bright}Esperando a que el servidor esté listo...${colors.reset}`);
  
  // Esperar a que el servidor esté listo comprobando periódicamente
  let isReady = false;
  let attempts = 0;
  const maxAttempts = 20;
  const serverUrl = `http://localhost:${availablePort}`;
  
  while (!isReady && attempts < maxAttempts) {
    attempts++;
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
    
    try {
      const { connected, data } = await testConnection(serverUrl);
      
      if (connected) {
        isReady = true;
        console.log(`\n${colors.fg.green}${colors.bright}¡Servidor iniciado correctamente!${colors.reset}`);
        
        if (data && typeof data === 'object') {
          console.log(`${colors.fg.green}Respuesta del servidor: ${JSON.stringify(data, null, 2)}${colors.reset}`);
        }
      } else {
        process.stdout.write('.');
      }
    } catch (err) {
      process.stdout.write('.');
    }
  }
  
  if (!isReady) {
    console.log(`\n${colors.fg.yellow}${colors.bright}El servidor puede estar iniciándose aún...${colors.reset}`);
  }
  
  console.log(`\n${colors.fg.cyan}${colors.bright}Servidor iniciado en ${serverUrl}${colors.reset}`);
  console.log(`${colors.fg.yellow}Presiona Ctrl+C para detener el servidor${colors.reset}\n`);
  
  // Mostrar URL para verificación de salud del servidor
  console.log(`${colors.bg.green}${colors.fg.black}${colors.bright} Health check URL: ${serverUrl}/health ${colors.reset}`);
  
  // Verificar conexión frontend-backend
  console.log(`\n${colors.fg.cyan}${colors.bright}Verificando integración con el frontend...${colors.reset}`);
  
  // Actualizar configuración del frontend si es necesaria para apuntar al backend correcto
  const connectivityPath = path.join(__dirname, 'src/services/api/connectivity.ts');
  if (fs.existsSync(connectivityPath)) {
    try {
      let connectivityContent = fs.readFileSync(connectivityPath, 'utf8');
      
      // Si el frontend tiene configurado otros puertos, asegurarnos de que también pruebe con nuestro puerto actual
      if (!connectivityContent.includes(`'http://localhost:${availablePort}'`)) {
        const serverUrlsPattern = /serverUrls = \[(.*?)\]/s;
        const match = connectivityContent.match(serverUrlsPattern);
        
        if (match) {
          const serverUrls = match[1];
          const newServerUrls = `'http://localhost:${availablePort}', ${serverUrls}`;
          connectivityContent = connectivityContent.replace(serverUrlsPattern, `serverUrls = [${newServerUrls}]`);
          
          fs.writeFileSync(connectivityPath, connectivityContent);
          console.log(`${colors.fg.green}✓ Frontend actualizado para usar el puerto ${availablePort}${colors.reset}`);
        }
      }
    } catch (err) {
      console.log(`${colors.fg.yellow}! No se pudo actualizar la configuración del frontend: ${err.message}${colors.reset}`);
    }
  }
}

// Iniciar el backend
startBackend().catch(err => {
  console.error(`${colors.fg.red}${colors.bright}Error iniciando el backend: ${err.message}${colors.reset}`);
  process.exit(1);
});