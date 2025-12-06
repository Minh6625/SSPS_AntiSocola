/**
 * MAIN PAGE - User Management
 */

'use client';

import { useState, useEffect } from 'react';
import { User, UserCreateDTO } from '@/types/user';
import { userService } from '@/services/userService';
import UserForm from '@/components/UserForm';
import UserList from '@/components/UserList';

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch users khi component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: UserCreateDTO) => {
    await userService.createUser(data);
    await fetchUsers(); // Refresh list
  };

  const handleUpdate = async (data: UserCreateDTO) => {
    if (editingUser) {
      await userService.updateUser(editingUser.id, data);
      setEditingUser(null);
      await fetchUsers();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        await fetchUsers();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete user');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <main className="container">
      <h1>User Management - Layered Architecture</h1>
      
      {error && <div className="error-banner">{error}</div>}

      <div className="content">
        <section className="form-section">
          <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
          <UserForm
            initialData={editingUser ? { email: editingUser.email, fullName: editingUser.fullName } : undefined}
            onSubmit={editingUser ? handleUpdate : handleCreate}
            submitLabel={editingUser ? 'Update' : 'Create'}
          />
          {editingUser && (
            <button onClick={() => setEditingUser(null)}>Cancel Edit</button>
          )}
        </section>

        <section className="list-section">
          <UserList
            users={users}
            onDelete={handleDelete}
            onEdit={setEditingUser}
          />
        </section>
      </div>
    </main>
  );
}
