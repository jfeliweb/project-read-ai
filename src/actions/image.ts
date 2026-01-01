'use server';

import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function generateImageAi(prompt: string): Promise<string> {
  try {
    console.log('Generating image for prompt:', prompt);

    const output = await replicate.run('black-forest-labs/flux-schnell', {
      input: {
        prompt: `${prompt}, vibrant colors, cartoon style, children's book illustration, high quality, detailed`,
        num_outputs: 1,
        aspect_ratio: '1:1',
        output_format: 'webp',
        output_quality: 90,
      },
    });

    // The output is an array of URLs
    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (typeof imageUrl === 'string') {
      console.log('Image generated successfully:', imageUrl);
      return imageUrl;
    }

    throw new Error('Invalid response from Replicate API');
  } catch (error) {
    console.error('Error generating image:', error);

    // Return a placeholder image if generation fails
    return '/images/placeholder.jpeg';
  }
}
