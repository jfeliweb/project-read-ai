'use server';

import Replicate from 'replicate';
import { v2 as cloudinary } from 'cloudinary';
import { nanoid } from 'nanoid';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateImageAi(imagePrompt: string): Promise<string> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Generating image for prompt (attempt ${attempt}/${maxRetries}):`,
        imagePrompt,
      );

      // Step 1: Generate image using Replicate API
      const input = {
        prompt: `${imagePrompt}, vibrant colors, cartoon style, children's book illustration, high quality, detailed`,
        aspect_ratio: '1:1',
        output_format: 'png',
        output_quality: 80,
      };

      const output = await replicate.run(
        'bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637',
        {
          input,
        },
      );

      console.log('Image generated from Replicate');

      // Step 2: Handle the output - can be a URL string or ReadableStream
      let buffer: Buffer;

      if (Array.isArray(output) && output.length > 0) {
        const firstOutput = output[0];

        // Check if it's a ReadableStream (newer Replicate SDK behavior)
        if (
          firstOutput &&
          typeof firstOutput === 'object' &&
          'getReader' in firstOutput
        ) {
          console.log('Reading image from stream...');
          const stream = firstOutput as ReadableStream;
          const reader = stream.getReader();
          const chunks: Uint8Array[] = [];

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }

          // Combine all chunks into a single buffer
          const totalLength = chunks.reduce(
            (acc, chunk) => acc + chunk.length,
            0,
          );
          buffer = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
          console.log(`Stream read complete: ${totalLength} bytes`);
        } else if (typeof firstOutput === 'string') {
          // It's a URL string - fetch it
          console.log('Fetching image from URL:', firstOutput);
          const response = await fetch(firstOutput);
          const arrayBuffer = await response.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
        } else {
          throw new Error(
            `Unexpected output format from Replicate: ${typeof firstOutput}`,
          );
        }
      } else {
        throw new Error('No output received from Replicate API');
      }

      // Step 3: Upload the image to Cloudinary using a buffer
      const uploadResponse = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: 'ai_kids_book',
                public_id: nanoid(),
              },
              (error, result) => {
                if (error) reject(error);
                else if (result) resolve(result);
                else reject(new Error('No result from Cloudinary'));
              },
            )
            .end(buffer);
        },
      );

      // Step 4: Return the cloudinary image URL
      const cloudinaryUrl = uploadResponse.secure_url;
      console.log('Image uploaded to Cloudinary:', cloudinaryUrl);
      return cloudinaryUrl;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if it's a rate limit error (429)
      if (
        error instanceof Error &&
        error.message.includes('429') &&
        error.message.includes('Too Many Requests')
      ) {
        // Extract retry_after duration from error message
        const retryMatch = error.message.match(/"retry_after":(\d+)/);
        const retryAfter = retryMatch ? parseInt(retryMatch[1]) : 10;

        console.log(
          `Rate limited. Waiting ${retryAfter} seconds before retry ${attempt}/${maxRetries}...`,
        );

        if (attempt < maxRetries) {
          await sleep(retryAfter * 1000);
          continue; // Retry
        }
      }

      // If it's not a rate limit error or we've exhausted retries, throw
      if (attempt === maxRetries) {
        console.error('Error generating image after all retries:', lastError);
        throw new Error(
          lastError.message || 'Failed to generate image after retries',
        );
      }
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError || new Error('Failed to generate image');
}
