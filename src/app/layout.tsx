import { UserProvider } from '@auth0/nextjs-auth0/client';
import type { Metadata } from 'next';
import './globals.css';

const metadata: Metadata = {
  title: 'ChatGPT-Clone',
};

interface RootLayoutProps {
  children: React.ReactNode;
};

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {

  return (
    <html lang='en'>
      <body>
        <UserProvider>
          { children }
        </UserProvider>
      </body>
    </html>
  );
};

export { metadata };
export default RootLayout;
