import './Navbar.css';
import './AuthNavbar.css';
import LogoLight from '../../assets/logo_dark.png'; // Логотип для светлой темы
import LogoDark from '../../assets/logo_dark.png';  // Логотип для темной темы
import { useDispatch, useSelector } from 'react-redux';
import { toggleSettings, toggleTheme } from './uiSlice';
import SettingsDark from '../../assets/settings.svg'; // Иконка для темной темы
import SettingsLight from '../../assets/setting2.svg'; // Иконка для светлой темы
import MoonIcon from '../../assets/Moon.png';
import SunIcon from '../../assets/sun.svg';
import Settings from './Settings';
import { Link } from 'react-router-dom';
import { RootState } from '../../app/store';
import { useEffect } from 'react';

const AuthNavbar = () => {
  const dispatch = useDispatch();
  const isDarkTheme = useSelector((state: RootState) => state.ui.isDarkTheme);

  // Установка темы из localStorage при загрузке
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' && !isDarkTheme) {
      dispatch(toggleTheme());
    } else if (savedTheme === 'light' && isDarkTheme) {
      dispatch(toggleTheme());
    }
  }, [dispatch]);

  // Применение класса темы к body и сохранение в localStorage
  useEffect(() => {
    document.body.className = isDarkTheme ? 'dark-theme' : 'light-theme';
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  return (
    <>
      <nav className="nav-auth">
        <div className="nav-content-wrapper">
          <div className="nav-content">
            <Link to="/boards">
              <img
                className="logo"
                src={isDarkTheme ? LogoDark : LogoLight} // Логика смены логотипа
                alt="App Logo"
              />
            </Link>
            <div className="nav-controls">
              <button 
                className="theme-toggle"
                onClick={() => dispatch(toggleTheme())}
              >
                <img
                  src={isDarkTheme ? SunIcon : MoonIcon}
                  alt={isDarkTheme ? "Light Theme" : "Dark Theme"}
                  className="theme-icon"
                />
              </button>
              <button
                className="settings-btn"
                onClick={() => dispatch(toggleSettings())}
              >
                <img
                  className="settings-img"
                  src={isDarkTheme ? SettingsDark : SettingsLight} // Логика смены иконки Settings
                  alt="Settings"
                  draggable="false"
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <Settings />
    </>
  );
};

export default AuthNavbar;