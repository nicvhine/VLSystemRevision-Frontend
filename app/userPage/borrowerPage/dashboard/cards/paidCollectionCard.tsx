'use client';
import React from 'react';
import { Collection } from '@/app/commonComponents/utils/Types/collection';

interface PaidCollectionCardProps {
  collection: Collection;
}

export default function PaidCollectionCard({ collection }: PaidCollectionCardProps) {
  return (
    <div className="p-4 rounded-xl shadow bg-gray-100 flex justify-between items-center opacity-80 cursor-not-allowed">
      <div>
        <p className="font-semibold text-gray-600">Collection #{collection.collectionNumber}</p>
        <p className="text-sm text-gray-500">
          <span className="font-medium">Due:</span> {new Date(collection.dueDate).toLocaleDateString('en-PH')}
        </p>
      </div>
      <div className="flex flex-col items-end">
        <span className="font-semibold text-gray-800">₱{collection.paidAmount.toLocaleString()}</span>
        <span className="text-sm font-medium text-green-700 px-2 py-1 rounded-full mt-1">Paid</span>
      </div>
    </div>
  );
}
