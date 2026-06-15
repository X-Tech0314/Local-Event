import { Jimp } from "jimp";

async function makeTransparent(inputPath, outputPath) {
    try {
        console.log(`Processing ${inputPath}...`);
        const image = await Jimp.read(inputPath);
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];
            // If pixel is very close to white, make it transparent
            if (red > 230 && green > 230 && blue > 230) {
                this.bitmap.data[idx + 3] = 0;
            }
        });
        await image.write(outputPath);
        console.log(`Saved transparent image to ${outputPath}`);
    } catch (e) {
        console.error(`Failed to process ${inputPath}:`, e);
    }
}

async function main() {
    await makeTransparent('../src/assets/venu-logo2.jpg', '../src/assets/venu-logo2-transparent.png');
    await makeTransparent('../src/assets/venu-logo3.jpg', '../src/assets/venu-logo3-transparent.png');
}

main();
