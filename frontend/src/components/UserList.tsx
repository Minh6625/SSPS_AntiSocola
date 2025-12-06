/**
 * USER LIST COMPONENT
 */

'use client';

import { User } from '@/types/user';

interface UserListProps {
  users: User[];
  onDelete: (id: number) => void;
  onEdit: (user: User) => void;
}

export default function UserList({ users, onDelete, onEdit }: UserListProps) {
  return (
    <div className="user-list">
      <h2>Users List</h2>
      
      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Full Name</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.fullName}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => onEdit(user)}>Edit</button>
                  <button onClick={() => onDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
