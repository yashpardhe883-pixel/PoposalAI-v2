declare module 'react-signature-canvas' {
  import * as React from 'react'

  export interface SignatureCanvasProps {
    penColor?: string
    minWidth?: number
    maxWidth?: number
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>
  }

  export default class SignatureCanvas extends React.Component<SignatureCanvasProps> {
    clear(): void
    isEmpty(): boolean
    toDataURL(type?: string): string
  }
}
