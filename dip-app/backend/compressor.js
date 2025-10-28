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
app.use(express.json());

let lastCompressionResults = null;

app.get('/results', (req, res) => {
  if (!lastCompressionResults) {
    return res.status(404).json({ error: 'No compression results available yet.' });
  }
  res.json(lastCompressionResults);
});

app.post('/compress', upload.single('file'), async (req, res) => {

  lastCompressionResults=null;

  const inputPath = req.file.path;
  const cwdDir = path.dirname(inputPath);
  const originalNamePath = path.resolve(path.join(cwdDir, req.file.originalname));
  console.log(originalNamePath)
  const outputPath = `${originalNamePath}.7z`;

  const cleanup = () => {
    try { fs.unlinkSync(originalNamePath); } catch (e) {}
    try { fs.unlinkSync(outputPath); } catch (e) {}
    try { fs.unlinkSync(inputPath); } catch (e) {}
  };


  let responded = false;
  let startTime = null;

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

    const compressionOptions = {
    $bin: sevenBin.path7za,
    method: [`0=${userOptions.method || 'lzma2'}`], // -m0=lzma2
    mx: userOptions.level ?? 9,                    // -mx=9
    ...(userOptions.solid ? { ms: userOptions.solid } : {}),   // -ms=on/off/size
    ...(userOptions.threads ? { mmt: userOptions.threads } : {}), // -mmt=4
    };


    if (userOptions.method === 'lzma' || userOptions.method === 'lzma2') {
      if (userOptions.dictExp) {
        const dictSizeBytes = 1 << userOptions.dictExp;
        compressionOptions.dictSize = dictSizeBytes;
      }
    }

    if (userOptions.method === 'ppmd') {
      if (userOptions.ppmdWordExp) {
        const wordSizeBytes = 1 << userOptions.ppmdWordExp;
        compressionOptions.wordSize = wordSizeBytes;
      }
    }

    const startTime = Date.now();

    const archive = add(outputPath, originalNamePath, compressionOptions);

    archive.on('end', () => {
        if (responded) return;
        responded = true;

        const endTime = Date.now();
        const compressionTime = (endTime - startTime) / 1000;
        const originalSize = fs.statSync(originalNamePath).size;
        const compressedSize = fs.statSync(outputPath).size;
        const compressionRatio = (originalSize / compressedSize).toFixed(2);
        const compressionPercent = ((1 - compressedSize / originalSize) * 100).toFixed(2);
        const fileType = path.extname(originalNamePath).slice(1) || 'unknown';

        console.log([
          req.file.originalname,
          fileType,
          userOptions.method || 'lzma2',
          userOptions.level ?? 9,
          compressionTime,
          originalSize,
          compressedSize,
          compressionRatio,
          compressionPercent
        ].join(';'));

        lastCompressionResults = {
          fileName: req.file.originalname,
          fileType,
          method: userOptions.method || 'lzma2',
          level: userOptions.level ?? 9,
          compressionTime,
          originalSize,
          compressedSize,
          compressionRatio,
          compressionPercent
        };

        const stream = fs.createReadStream(outputPath);
        res.setHeader('Content-Type', 'application/x-7z-compressed');
        res.setHeader('Content-Disposition', `attachment; filename="${req.file.originalname}.7z"`);
        stream.pipe(res);

        stream.on('close', cleanup);
    });

    archive.on('error', (err) => {
        console.error(err);
        if (!responded) {
            responded = true;
            res.status(500).send('Compression failed');
        }
        });

    res.on('close', () => {
      if (!responded) {
        console.log('Connection closed early.');
        cleanup();
      }
    });

  } catch (e) {
    res.status(500).send('Error starting compression');
    cleanup();
  }
});

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));