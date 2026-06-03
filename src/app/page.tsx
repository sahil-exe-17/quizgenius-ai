import styles from './page.module.css';

import FileUpload from '@/components/FileUpload';

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Transform your PDFs into <span className="text-gradient">Interactive Quizzes</span>
        </h1>
        <p className={styles.subtitle}>
          Upload your notes, books, or study materials. Our AI analyzes the content and automatically generates personalized quizzes, flashcards, and revision notes in seconds.
        </p>
      </header>
      
      <section className={styles.uploadSection}>
        <FileUpload />
      </section>
    </div>
  );
}
