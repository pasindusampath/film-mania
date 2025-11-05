import { useState, useEffect } from 'react';
import Head from 'next/head';
import ItemList from '../components/ItemList';
import AddItemForm from '../components/AddItemForm';
import styles from '../styles/Home.module.css';

interface Item {
  id: number;
  name: string;
  description: string;
}

interface ApiResponse {
  success: boolean;
  data: Item[];
  count: number;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const fetchItems = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/items`);
      const data: ApiResponse = await response.json();
      setItems(data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (name: string, description: string): Promise<void> => {
    try {
      const response = await fetch(`${apiUrl}/api/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchItems();
      }
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>NX Monorepo Demo</title>
        <meta name="description" content="NX Monorepo with CI/CD" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span className={styles.highlight}>NX Monorepo</span>
        </h1>

        <p className={styles.description}>
          A modern monorepo setup with CI/CD for VPS deployment
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Add New Item</h2>
            <AddItemForm onAdd={handleAddItem} />
          </div>

          <div className={styles.card}>
            <h2>Items</h2>
            {loading && <p>Loading...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {!loading && !error && <ItemList items={items} />}
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>🚀 NX Monorepo</h3>
            <p>Powerful build system and tooling</p>
          </div>
          <div className={styles.feature}>
            <h3>⚙️ CI/CD Ready</h3>
            <p>Automated deployments with GitHub Actions</p>
          </div>
          <div className={styles.feature}>
            <h3>🐳 Docker</h3>
            <p>Containerized for easy deployment</p>
          </div>
        </div>
      </main>
    </div>
  );
}
