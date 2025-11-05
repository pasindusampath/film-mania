import React, { useState, FormEvent } from 'react';
import styles from '../styles/AddItemForm.module.css';

interface AddItemFormProps {
  onAdd: (name: string, description: string) => Promise<void>;
}

export default function AddItemForm({ onAdd }: AddItemFormProps) {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onAdd(name, description);
    setName('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="name">Name *</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="description">Description</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Item description"
        />
      </div>
      <button type="submit" className={styles.button}>
        Add Item
      </button>
    </form>
  );
}
