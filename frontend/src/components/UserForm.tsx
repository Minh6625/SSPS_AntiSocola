/**
 * USER FORM COMPONENT - Tái sử dụng cho Create/Update
 */

'use client';

import { useState, FormEvent } from 'react';
import { UserCreateDTO } from '@/types/user';

interface UserFormProps {
  initialData?: UserCreateDTO;
  onSubmit: (data: UserCreateDTO) => Promise<void>;
  submitLabel: string;
}

export default function UserForm({ initialData, onSubmit, submitLabel }: UserFormProps) {
  const [formData, setFormData] = useState<UserCreateDTO>(
    initialData || { email: '', fullName: '' }
  );
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(formData);
      // Reset form nếu là create
      if (!initialData) {
        setFormData({ email: '', fullName: '' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="fullName">Full Name:</label>
        <input
          type="text"
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
          minLength={2}
          maxLength={100}
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : submitLabel}
      </button>
    </form>
  );
}
