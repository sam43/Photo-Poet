# PhotoPoet

## Getting Started

This is a NextJS app that generates poems from photos using Genkit for AI functionality.

To run this app locally:

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Set up environment variables:**

    *   Create a `.env` file in the root directory.
    *   Add your Google GenAI API key:

        ```
        GOOGLE_GENAI_API_KEY=YOUR_API_KEY
        ```

        You can obtain an API key from the Google AI Studio:  [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

3.  **Start the Genkit development server:**

    ```bash
    npm run genkit:dev
    ```

    Or, to enable watching for changes:

    ```bash
    npm run genkit:watch
    ```

4.  **Start the Next.js development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

*   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
*   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

To learn more about Genkit, take a look at the following resources:

*   [Genkit Documentation](https://genkit.dev/reference/genkit-cli) - learn about Genkit.
