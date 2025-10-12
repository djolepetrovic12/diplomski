import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { add } from 'node-7z';
import sevenBin from '7zip-bin';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

app.post('/compress', upload.single('file'), async (req, res) => {
  const inputPath = req.file.path;
  const cwdDir = path.dirname(inputPath);
  const originalNamePath = path.resolve(path.join(cwdDir, req.file.originalname));

  const outputPath = `${originalNamePath}.7z`;

  let responded = false;

  try {
    fs.renameSync(inputPath, originalNamePath);

    let userOptions = {};
    if (req.body.settings) {
      try {
        userOptions = JSON.parse(req.body.settings);
      } catch (e) {
        console.warn('Invalid settings JSON, ignoring.');
      }
    }

    console.log(userOptions);

    const compressionOptions = {
    $bin: sevenBin.path7za,
    method: [`0=${userOptions.method || 'lzma2'}`], // -m0=lzma2
    mx: userOptions.level ?? 9,                    // -mx=9
    ...(userOptions.solid ? { ms: userOptions.solid } : {}),   // -ms=on/off/size
    ...(userOptions.threads ? { mmt: userOptions.threads } : {}), // -mmt=4
    };

    const archive = add(outputPath, originalNamePath, compressionOptions);

    archive.on('end', () => {
        if (responded) return;
        responded = true;

        const stream = fs.createReadStream(outputPath);
        res.setHeader('Content-Type', 'application/x-7z-compressed');
        res.setHeader('Content-Disposition', `attachment; filename="${req.file.originalname}.7z"`);
        stream.pipe(res);

        stream.on('close', () => {
            try { fs.unlinkSync(originalNamePath); } catch(e){}
            try { fs.unlinkSync(outputPath); } catch(e){}
        });
    });

    archive.on('error', (err) => {
        console.error(err);
        if (!responded) {
            responded = true;
            res.status(500).send('Compression failed');
        }
        });

  } catch (e) {
    res.status(500).send('Error starting compression');
  }
});

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));