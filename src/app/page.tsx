"use client";
import { css } from "@emotion/react";

export default function Home() {
  return (
    <main css={styles.mainContainer}>
      <h1 className="text-4xl font-bold text-center sm:text-left">
        Welcome to my Website
      </h1>
    </main>
  );
}

const styles = {
  mainContainer: css`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  `,
};