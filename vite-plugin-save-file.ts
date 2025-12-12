import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export function saveFilePlugin(): Plugin {
  return {
    name: 'save-file-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-certificate', async (req, res, _next) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const { filename, content } = JSON.parse(body);
            
            if (!filename || !content) {
              res.statusCode = 400;
              res.end('Missing filename or content');
              return;
            }

            // Ensure the certificates directory exists
            const certificatesDir = path.resolve(__dirname, 'public/certificates');
            if (!fs.existsSync(certificatesDir)) {
              fs.mkdirSync(certificatesDir, { recursive: true });
            }

            // Sanitize filename
            const sanitizedFilename = filename
              .replace(/[^a-zA-Z0-9._-]/g, '_')
              .replace(/\.html$/, '') + '.html';

            const filePath = path.join(certificatesDir, sanitizedFilename);
            
            // Write the file
            fs.writeFileSync(filePath, content, 'utf-8');

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: true, 
              message: 'File saved successfully',
              filename: sanitizedFilename,
              path: `/certificates/${sanitizedFilename}`
            }));
          } catch (error) {
            console.error('Error saving file:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            }));
          }
        });
      });

      // Endpoint to list all certificate files
      server.middlewares.use('/api/list-certificates', async (req, res, _next) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }

        try {
          const certificatesDir = path.resolve(__dirname, 'public/certificates');
          
          if (!fs.existsSync(certificatesDir)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, certificates: [] }));
            return;
          }

          const files = fs.readdirSync(certificatesDir);
          const htmlFiles = files
            .filter(file => file.endsWith('.html') && file !== 'README.md')
            .map(file => {
              const filePath = path.join(certificatesDir, file);
              const stats = fs.statSync(filePath);
              return {
                filename: file,
                path: `/certificates/${file}`,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
              };
            })
            .sort((a, b) => b.modified.getTime() - a.modified.getTime()); // Sort by most recent first

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            success: true, 
            certificates: htmlFiles 
          }));
        } catch (error) {
          console.error('Error listing certificates:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }));
        }
      });
    },
  };
}

