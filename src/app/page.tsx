'use client';

import { Button } from '@/components/ui/button';
import { useUser } from '@auth0/nextjs-auth0/client';


const Home = () => {

  const { user, isLoading } = useUser(); 

  return (
    <div>
      <h1>Welcome</h1>
      {
        user && !isLoading && (
            <Button onClick={() => window.location.href = '/api/auth/logout'}>Logout</Button>
        )
      }
      {
        isLoading && (
          <div>Loading...</div>
        )
      }
      {
        !user && !isLoading && (
          <Button onClick={() => window.location.href = '/api/auth/login'}>Login</Button>
        )
      }
    </div>
  );
};

export default Home;
