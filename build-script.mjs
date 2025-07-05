import { nextBuild } from 'next/dist/cli/next-build';

// Run the Next.js build process
nextBuild(process.cwd())
    .then(() => {
        console.log('Build completed successfully!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Build failed:', err);
        process.exit(1);
    });
