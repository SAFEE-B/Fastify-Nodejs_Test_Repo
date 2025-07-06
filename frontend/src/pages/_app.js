import "@/styles/globals.css";
import Head from 'next/head';
import { CssBaseline } from '@mui/material';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Email Client</title>
        <meta name="description" content="Simple email client application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CssBaseline />
      <Component {...pageProps} />
    </>
  );
}
