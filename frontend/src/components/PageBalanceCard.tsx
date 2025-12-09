'use client';

import React from 'react';

interface PageBalanceCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  unit?: string;
}

/**
 * COMPONENT: PageBalanceCard
 * Hiển thị một card số dư trang
 * 
 * Props:
 * - title: Tiêu đề (ví dụ: "Số dư trang A4")
 * - value: Giá trị số dư
 * - icon: Emoji icon
 * - color: Màu border (blue, green, orange, purple)
 * - unit: Đơn vị (mặc định: "trang")
 */
export default function PageBalanceCard({
  title,
  value,
  icon,
  color,
  unit = 'trang',
}: PageBalanceCardProps) {
  const colorClasses: { [key: string]: string } = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    orange: 'border-orange-500',
    purple: 'border-purple-500',
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-4xl font-bold text-gray-800 mt-3">{value}</p>
          <p className="text-gray-500 text-xs mt-2">{unit}</p>
        </div>
        <div className="text-5xl">{icon}</div>
      </div>
    </div>
  );
}
