import React from 'react';
import { Loader2 } from 'lucide-react';

const FullScreenLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
  </div>
);

export default FullScreenLoader;
