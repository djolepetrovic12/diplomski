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

        const archive = add(outputPath, originalNamePath, {
        $bin: sevenBin.path7za,
        method: ['0=lzma2'],
        mx: 9,
    });

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