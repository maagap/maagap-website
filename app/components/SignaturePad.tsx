'use client';

import { useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  initialValue?: string;
}

export default function SignaturePad({ onSave, initialValue }: SignaturePadProps) {
  const sigPad = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (initialValue && sigPad.current) {
      sigPad.current.fromDataURL(initialValue);
    }
  }, [initialValue]);

  const clear = () => {
    sigPad.current?.clear();
  };

  const save = () => {
    if (sigPad.current) {
      const signature = sigPad.current.toDataURL('image/png');
      onSave(signature);
    }
  };

  return (
    <div className="space-y-2">
      <SignatureCanvas
        ref={sigPad}
        penColor="black"
        canvasProps={{
          className: 'signature-pad w-full h-40 bg-white',
        }}
      />
      <div className="flex gap-2">
        <button type="button" onClick={clear} className="btn-secondary text-sm">
          Clear
        </button>
        <button type="button" onClick={save} className="btn-primary text-sm">
          Save Signature
        </button>
      </div>
    </div>
  );
}
