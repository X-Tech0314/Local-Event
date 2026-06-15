const fs = require('fs');
const { Jimp } = require('jimp');

async function removeBackground() {
    try {
        const imagePath = process.argv[2];
        const outputPath = process.argv[3];
        console.log(`Reading image from ${imagePath}...`);
        
        const buffer = fs.readFileSync(imagePath);
        const image = await Jimp.read(buffer);
        
        const width = image.bitmap.width;
        const height = image.bitmap.height;
        
        const tolerance = 240;

        image.scan(0, 0, width, height, function(x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            
            if (r >= tolerance && g >= tolerance && b >= tolerance) {
                this.bitmap.data[idx + 3] = 0; 
            }
        });

        await image.write(outputPath);
        console.log(`Successfully saved processed image to ${outputPath}`);
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

removeBackground();
