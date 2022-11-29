import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User as AuthUser,
} from 'firebase/auth';
import {
  ChangeEventHandler,
  FormEventHandler,
  MouseEventHandler,
  useEffect,
  useState,
} from 'react';

export const App = () => {
  const { initialized, authUser } = useAuth();

  return (
    <div
      style={{
        width: '320px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ textAlign: 'center' }}>Firebase Auth Test</div>
      {initialized ? (
        authUser ? (
          <Protected authUser={authUser} />
        ) : (
          <Public />
        )
      ) : (
        <div style={{ textAlign: 'center' }}>Loading</div>
      )}
    </div>
  );
};

/* ------------------------------- components ------------------------------- */
const Public = () => {
  const [tab, setTab] = useState<'sign-up' | 'sign-in'>('sign-in');

  return (
    <div>
      {tab == 'sign-up' && (
        <div>
          <SignUpForm />
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setTab('sign-in');
            }}
          >
            to sign in
          </a>
        </div>
      )}

      {tab == 'sign-in' && (
        <div>
          <SignInForm />
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setTab('sign-up');
            }}
          >
            to sign up
          </a>
        </div>
      )}
    </div>
  );
};

const SignUpForm = () => {
  const emailInput = useTextInput();
  const passwordInput = useTextInput();
  const confirmationInput = useTextInput();

  const onSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    if (passwordInput.value != confirmationInput.value) alert('Password does not match.');
    await createUserWithEmailAndPassword(getAuth(), emailInput.value, passwordInput.value);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div>
          <div>Email</div>
          <input type="email" required {...emailInput.bind} style={{ width: '100%' }} />
        </div>
        <div>
          <div>Password</div>
          <input
            type="password"
            required
            minLength={8}
            {...passwordInput.bind}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <div>Confirmation</div>
          <input
            type="password"
            required
            minLength={8}
            {...confirmationInput.bind}
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', marginTop: '12px' }}>
          Sign Up
        </button>
      </form>
    </div>
  );
};

const SignInForm = () => {
  const emailInput = useTextInput();
  const passwordInput = useTextInput();

  const onSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    await signInWithEmailAndPassword(getAuth(), emailInput.value, passwordInput.value);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div>
          <div>Email</div>
          <input type="email" required {...emailInput.bind} style={{ width: '100%' }} />
        </div>
        <div>
          <div>Password</div>
          <input
            type="password"
            required
            minLength={8}
            {...passwordInput.bind}
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', marginTop: '12px' }}>
          Sign In
        </button>
      </form>
    </div>
  );
};

const Protected = ({ authUser }: { authUser: AuthUser }) => {
  const AUTH_URL = 'http://localhost:3000';

  const [me, setMe] = useState();

  useEffect(() => {
    let ignore = false;
    authUser
      .getIdToken()
      .then((token) =>
        fetch([AUTH_URL, 'me'].join('/'), { headers: { Authorization: `Bearer ${token}` } }),
      )
      .then(console.log);
    return () => {
      ignore = true;
    };
  }, []);

  const onSignOut: MouseEventHandler = async (e) => {
    e.preventDefault();
    signOut(getAuth());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div>uid: {authUser.uid}</div>
      <div>email: {authUser.email}</div>
      <a href="#" onClick={onSignOut} style={{ alignSelf: 'end' }}>
        Sign Out
      </a>
    </div>
  );
};

/* ---------------------------------- hooks --------------------------------- */
const useTextInput = (initValue = '') => {
  const [value, set] = useState(initValue);
  const onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    set(e.target.value);
  };
  return { value, set, onChange, bind: { value, onChange } };
};

const useAuth = () => {
  const [initialized, setInitialized] = useState(false);
  const [value, set] = useState<AuthUser | null>(null);
  useEffect(() => {
    onAuthStateChanged(getAuth(), (v) => {
      set(v);
      if (!initialized) setInitialized(true);
    });
  }, []);
  return { initialized, authUser: value };
};
