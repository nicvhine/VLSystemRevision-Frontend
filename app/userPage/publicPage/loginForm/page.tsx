'use client';

import { useState } from 'react';
import LoginModal from './loginModal'; 

export default function LoginPage() {
  const [isOpen, setIsOpen] = useState(true); 

  return (
    <div>
      <LoginModal
        isOpen={isOpen}
        onCloseAction={() => setIsOpen(false)}
      />
    </div>
  );
}
