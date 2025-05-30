import { Link, useNavigate } from 'react-router-dom';
import './auth.css';
import Logo from '../../assets/logo_dark.png'; // Логотип для светлой темы
import LogoDark from '../../assets/logo_dark.png'; // Логотип для темной темы
import { FormEvent, useState, useEffect } from 'react';
import { useLoginMutation } from '../api/apiSlice';
import { useDispatch } from 'react-redux';
import { setUser } from './authSlice';
import useForm from '../../hooks/useForm';
import noAuthRoute from './NoAuthRoute';
import { showToast } from '../ui/uiSlice';
import Toast from '../ui/Toast';
import { ValidationErrors } from '../api/apiSlice';
import LoaderInline from '../ui/LoaderInline';

const LoginPage = () => {
  const [values, handleChange] = useForm({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(false); // Добавлено состояние для темы
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  // Проверяем текущую тему при загрузке компонента
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme'); // Получаем тему из localStorage
    const isDark = savedTheme === 'dark';
    setIsDarkTheme(isDark);

    // Применяем тему к body
    document.body.classList.toggle('dark-theme', isDark);
    document.body.classList.toggle('light-theme', !isDark);
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const { username, password } = values;
    const newErrors = { username: '', password: '' };
    setErrors(newErrors);

    if (username.length < 3) {
      newErrors.username = 'Username have to be at least 3 characters long';
    }
    if (password.length < 4) {
      newErrors.password = 'Password have to be at least 4 characters long';
    }
    setErrors(newErrors);

    if (isLoading || newErrors.username || newErrors.password) return;

    try {
      const result = await login({ username, password }).unwrap();

      dispatch(setUser(result));
      dispatch(showToast({ msg: 'Successfully logged in', type: 'success' }));

      navigate('/');
    } catch (err: any) {
      if (!err.data) {
        setError('Failed to login. Please try again later.');
        return;
      }

      switch (err.status) {
        case 422: {
          const errors: ValidationErrors<typeof values> = err.data;
          const newErrors = {
            username: errors.username?.msg || '',
            password: errors.password?.msg || '',
          };
          setErrors(newErrors);
          break;
        }
        default:
          setError(err.data.msg);
          break;
      }
    }
  };

  return (
    <>
      <Toast />
      <div className="login-page">
        <div className="box">
          <Link to={'/'}>
            <img
              className="logo"
              src={isDarkTheme ? Logo : LogoDark} // Логика смены логотипа
              draggable="false"
              alt="Planit Logo"
            />
          </Link>
          <h2>Login to continue</h2>
          <form onSubmit={handleLogin}>
            <label>Username</label>
            <input
              type="text"
              value={values.username}
              name="username"
              className={errors.username ? 'invalid' : ''}
              onChange={handleChange}
            />
            <label>Password</label>
            <input
              type="password"
              value={values.password}
              name="password"
              className={errors.password ? 'invalid' : ''}
              onChange={handleChange}
            />
            <button className="btn" type="submit" disabled={isLoading}>
              {isLoading && <LoaderInline />}
              {!isLoading && 'Login'}
            </button>
            {error && <p className="errors">{error}</p>}
            {errors.username && <p className="errors">{errors.username}</p>}
            {errors.password && <p className="errors">{errors.password}</p>}
          </form>
          <div className="box-footer">
            <p>
              New to Planit? <Link to={'/register'}>Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const WrappedLoginPage = noAuthRoute(LoginPage);
export default WrappedLoginPage;