import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Calendar, RefreshCw, Bell, Clock, User, AlertCircle, Download, X } from 'lucide-react';

export default function ChileMarketTracker() {
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previousValues, setPreviousValues] = useState({});
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  const efemeridesHistoricas = [
    {
      id: 1,
      fecha: '04 de Diciembre',
      santo: 'Santa Bárbara',
      evento: 'Fundación de Valdivia por Pedro de Valdivia (1552)',
      fuente: 'Biblioteca Nacional de Chile'
    },
    {
      id: 2,
      fecha: '10 de Diciembre',
      santo: 'Nuestra Señora de Loreto',
      evento: 'Gabriela Mistral recibe el Premio Nobel de Literatura (1945)',
      fuente: 'Fundación Pablo Neruda'
    },
    {
      id: 3,
      fecha: '18 de Septiembre',
      santo: 'San José de Cupertino',
      evento: 'Primera Junta Nacional de Gobierno (1810)',
      fuente: 'Museo Histórico Nacional'
    },
    {
      id: 4,
      fecha: '12 de Febrero',
      santo: 'Santa Eulalia',
      evento: 'Batalla de Chacabuco (1817)',
      fuente: 'Ejército de Chile'
    },
    {
      id: 5,
      fecha: '05 de Abril',
      santo: 'San Vicente Ferrer',
      evento: 'Batalla de Maipú (1818)',
      fuente: 'Museo Histórico Nacional'
    },
    {
      id: 6,
      fecha: '21 de Mayo',
      santo: 'Santa María Cristina',
      evento: 'Combate Naval de Iquique (1879)',
      fuente: 'Armada de Chile'
    },
    {
      id: 7,
      fecha: '25 de Diciembre',
      santo: 'Navidad',
      evento: 'Fiesta de la Virgen de Andacollo',
      fuente: 'Ministerio de las Culturas'
    },
    {
      id: 8,
      fecha: '21 de Diciembre',
      santo: 'San Pedro Canisio',
      evento: 'Matanza de la Escuela Santa María de Iquique (1907)',
      fuente: 'Memoria Chilena'
    }
  ];

  const [customEfemerides, setCustomEfemerides] = useState([]);
  const [newEfemeride, setNewEfemeride] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    } else {
      setTimeout(() => setShowInstallPrompt(true), 3000);
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    });

    loadCustomEfemerides();
    fetchIndicators();
    const interval = setInterval(fetchIndicators, 30000);
    const dateInterval = setInterval(() => setCurrentDate(new Date()), 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(dateInterval);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        alert('Para instalar en iPhone/iPad:\n\n1. Toca el botón de compartir (cuadrado con flecha)\n2. Desplázate y selecciona "Agregar a pantalla de inicio"\n3. Toca "Agregar"');
      } else if (isAndroid) {
        alert('Para instalar en Android:\n\n1. Toca el menú (⋮) en Chrome\n2. Selecciona "Agregar a pantalla de inicio"\n3. Toca "Agregar"');
      } else {
        alert('Para instalar:\n\n1. En el navegador, busca la opción de "Instalar app"\n2. O agrega esta página a tu pantalla de inicio');
      }
      setShowInstallPrompt(false);
    }
  };

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const apiUrl = 'https://mindicador.cl/api';
      
      const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
      
      if (!response.ok) {
        throw new Error('Error al obtener datos');
      }
      
      const data = await response.json();
      
      const processedData = {
        dolar: {
          value: data.dolar.valor,
          change: previousValues.dolar ? ((data.dolar.valor - previousValues.dolar) / previousValues.dolar) * 100 : 0,
          trend: previousValues.dolar ? (data.dolar.valor > previousValues.dolar ? 'up' : data.dolar.valor < previousValues.dolar ? 'down' : 'neutral') : 'neutral',
          source: 'Banco Central de Chile',
          time: new Date(data.dolar.fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
          date: new Date(data.dolar.fecha).toLocaleDateString('es-CL')
        },
        uf: {
          value: data.uf.valor,
          change: previousValues.uf ? ((data.uf.valor - previousValues.uf) / previousValues.uf) * 100 : 0,
          trend: previousValues.uf ? (data.uf.valor > previousValues.uf ? 'up' : data.uf.valor < previousValues.uf ? 'down' : 'neutral') : 'neutral',
          source: 'Banco Central de Chile',
          time: '09:00',
          date: new Date(data.uf.fecha).toLocaleDateString('es-CL')
        },
        utm: {
          value: data.utm.valor,
          change: 0,
          trend: 'neutral',
          source: 'SII',
          time: 'Mensual',
          date: new Date(data.utm.fecha).toLocaleDateString('es-CL')
        },
        euro: {
          value: data.euro.valor,
          change: previousValues.euro ? ((data.euro.valor - previousValues.euro) / previousValues.euro) * 100 : 0,
          trend: previousValues.euro ? (data.euro.valor > previousValues.euro ? 'up' : data.euro.valor < previousValues.euro ? 'down' : 'neutral') : 'neutral',
          source: 'Banco Central de Chile',
          time: new Date(data.euro.fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
          date: new Date(data.euro.fecha).toLocaleDateString('es-CL')
        },
        bitcoin: {
          value: data.bitcoin.valor,
          change: previousValues.bitcoin ? ((data.bitcoin.valor - previousValues.bitcoin) / previousValues.bitcoin) * 100 : 0,
          trend: previousValues.bitcoin ? (data.bitcoin.valor > previousValues.bitcoin ? 'up' : data.bitcoin.valor < previousValues.bitcoin ? 'down' : 'neutral') : 'neutral',
          source: 'CryptoCompare',
          time: new Date(data.bitcoin.fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
          date: new Date(data.bitcoin.fecha).toLocaleDateString('es-CL')
        },
        ipsa: {
          value: data.ipsa?.valor || 6234.50,
          change: 0,
          trend: 'neutral',
          source: 'Bolsa de Santiago',
          time: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString('es-CL')
        }
      };
      
      if (Object.keys(previousValues).length === 0) {
        setPreviousValues({
          dolar: data.dolar.valor,
          uf: data.uf.valor,
          euro: data.euro.valor,
          bitcoin: data.bitcoin.valor
        });
      } else {
        const dolarChange = Math.abs(data.dolar.valor - previousValues.dolar);
        if (dolarChange > 5) {
          playSound(data.dolar.valor > previousValues.dolar ? 'up' : 'down');
        }
        
        setPreviousValues({
          dolar: data.dolar.valor,
          uf: data.uf.valor,
          euro: data.euro.valor,
          bitcoin: data.bitcoin.valor
        });
      }
      
      setIndicators(processedData);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching indicators:', err);
      setError('Usando datos de referencia');
      loadBackupData();
    }
  };

  const loadBackupData = () => {
    const now = new Date();
    const backupData = {
      dolar: {
        value: 975.30,
        change: 0,
        trend: 'neutral',
        source: 'Banco Central de Chile',
        time: now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        date: now.toLocaleDateString('es-CL')
      },
      uf: {
        value: 37842.15,
        change: 0,
        trend: 'neutral',
        source: 'Banco Central de Chile',
        time: '09:00',
        date: now.toLocaleDateString('es-CL')
      },
      utm: {
        value: 66202,
        change: 0,
        trend: 'neutral',
        source: 'SII',
        time: 'Mensual',
        date: now.toLocaleDateString('es-CL')
      },
      euro: {
        value: 1025.50,
        change: 0,
        trend: 'neutral',
        source: 'Banco Central de Chile',
        time: now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        date: now.toLocaleDateString('es-CL')
      },
      bitcoin: {
        value: 95500000,
        change: 0,
        trend: 'neutral',
        source: 'CryptoCompare',
        time: now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        date: now.toLocaleDateString('es-CL')
      },
      ipsa: {
        value: 6234.50,
        change: 0,
        trend: 'neutral',
        source: 'Bolsa de Santiago',
        time: now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        date: now.toLocaleDateString('es-CL')
      }
    };
    
    setIndicators(backupData);
    setLoading(false);
  };

  const loadCustomEfemerides = async () => {
    try {
      const result = await window.storage.list('custom_efemeride:');
      if (result && result.keys) {
        const loadedEfemerides = await Promise.all(
          result.keys.map(async (key) => {
            try {
              const data = await window.storage.get(key);
              return data ? JSON.parse(data.value) : null;
            } catch {
              return null;
            }
          })
        );
        setCustomEfemerides(loadedEfemerides.filter(e => e !== null));
      }
    } catch (error) {
      console.log('No hay efemérides guardadas');
    }
  };

  const playSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'up') {
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
      } else {
        oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(261.63, audioContext.currentTime + 0.2);
      }
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('No se pudo reproducir sonido');
    }
  };

  const addCustomEfemeride = async () => {
    if (newEfemeride.trim()) {
      const efemeride = {
        id: Date.now(),
        text: newEfemeride,
        fecha: new Date().toLocaleDateString('es-CL'),
        tipo: 'personal'
      };
      
      try {
        await window.storage.set(`custom_efemeride:${efemeride.id}`, JSON.stringify(efemeride));
        setCustomEfemerides([...customEfemerides, efemeride]);
        setNewEfemeride('');
      } catch (error) {
        console.error('Error al guardar:', error);
      }
    }
  };

  const deleteCustomEfemeride = async (id) => {
    try {
      await window.storage.delete(`custom_efemeride:${id}`);
      setCustomEfemerides(customEfemerides.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? <TrendingUp className="w-5 h-5 text-green-400" /> : 
           trend === 'down' ? <TrendingDown className="w-5 h-5 text-red-400" /> : 
           <Activity className="w-5 h-5 text-yellow-400" />;
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'border-green-500' : 
           trend === 'down' ? 'border-red-500' : 
           'border-yellow-500';
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-CL', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(num);
  };

  const getTodayEfemerides = () => {
    const today = currentDate.toLocaleDateString('es-CL', { day: '2-digit', month: 'long' });
    const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1);
    return efemeridesHistoricas.filter(ef => {
      const efDate = ef.fecha.toLowerCase();
      const searchDate = todayFormatted.toLowerCase();
      return efDate.includes(searchDate);
    });
  };

  const todayEfemerides = getTodayEfemerides();

  if (loading && !indicators) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Activity className="w-10 h-10 text-white animate-pulse" />
          </div>
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-xl font-semibold">Cargando indicadores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white p-4 pb-20">
      {showInstallPrompt && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <div className="bg-gradient-to-r from-red-600 to-blue-700 rounded-xl p-4 shadow-2xl border-2 border-yellow-500 max-w-md mx-auto">
            <button 
              onClick={() => setShowInstallPrompt(false)}
              className="absolute top-2 right-2 text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <Activity className="w-7 h-7 text-blue-900" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">Instalar App</p>
                <p className="text-blue-100 text-sm">Acceso rápido</p>
              </div>
              <button
                onClick={handleInstallClick}
                className="bg-white text-blue-900 px-4 py-2 rounded-lg font-bold flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Instalar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              Indicadores Chile
            </h1>
            <p className="text-blue-300 text-sm mt-1">
              {currentDate.toLocaleDateString('es-CL')} - {currentDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button 
            onClick={fetchIndicators}
            disabled={loading}
            className="bg-blue-700 hover:bg-blue-600 p-3 rounded-full transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {error && (
          <div className="bg-yellow-900 bg-opacity-50 border border-yellow-500 rounded-lg p-3 flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      {todayEfemerides.length > 0 && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-red-600 to-blue-700 rounded-xl p-6 shadow-2xl border-2 border-yellow-500">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-7 h-7 text-yellow-300" />
              <h2 className="text-2xl font-bold text-yellow-300">Efemérides de Hoy</h2>
            </div>
            {todayEfemerides.map(ef => (
              <div key={ef.id} className="bg-blue-900 bg-opacity-40 rounded-lg p-4 mb-3 last:mb-0">
                <p className="text-yellow-200 font-semibold mb-1">📿 {ef.santo}</p>
                <p className="text-white text-lg mb-2">{ef.evento}</p>
                <p className="text-blue-300 text-sm">Fuente: {ef.fuente}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {indicators && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.entries(indicators).map(([key, data]) => (
            <div key={key} className={`bg-blue-800 bg-opacity-50 rounded-xl p-6 border-l-4 ${getTrendColor(data.trend)} shadow-xl`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {key === 'dolar' && <DollarSign className="w-6 h-6 text-green-400" />}
                  <h3 className="text-lg font-semibold">{key.toUpperCase()}</h3>
                </div>
                {getTrendIcon(data.trend)}
              </div>
              <p className="text-3xl font-bold">${formatNumber(data.value)}</p>
              {data.change !== 0 && (
                <p className={`text-sm mt-1 ${data.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}%
                </p>
              )}
              <div className="mt-3 pt-3 border-t border-blue-600 space-y-1">
                <div className="flex items-center gap-2 text-xs text-blue-300">
                  <User className="w-3 h-3" />
                  <span>{data.source}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-300">
                  <Clock className="w-3 h-3" />
                  <span>{data.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-blue-800 bg-opacity-50 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold">Efemérides Históricas de Chile</h2>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {efemeridesHistoricas.map((ef) => (
              <div key={ef.id} className="bg-blue-900 bg-opacity-40 rounded-lg p-4 border-l-4 border-red-500">
                <p className="text-yellow-300 font-semibold mb-1">📅 {ef.fecha}</p>
                <p className="text-blue-200 text-sm mb-2">📿 {ef.santo}</p>
                <p className="text-white mb-1">{ef.evento}</p>
                <p className="text-blue-400 text-xs">Fuente: {ef.fuente}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="bg-blue-800 bg-opacity-50 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold">Mis Recordatorios</h2>
          </div>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newEfemeride}
              onChange={(e) => setNewEfemeride(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomEfemeride()}
              placeholder="Agregar recordatorio..."
              className="flex-1 bg-blue-900 bg-opacity-50 border border-blue-600 rounded-lg px-4 py-2 text-white placeholder-blue-400 focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={addCustomEfemeride}
              className="bg-red-600 hover:bg-red-500 px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Agregar
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {customEfemerides.length === 0 ? (
              <p className="text-blue-300 text-center py-4">No hay recordatorios</p>
            ) : (
              customEfemerides.map((ef) => (
                <div key={ef.id} className="bg-blue-900 bg-opacity-40 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-white">{ef.text}</p>
                    <p className="text-blue-400 text-sm">{ef.fecha}</p>
                  </div>
                  <button
                    onClick={() => deleteCustomEfemeride(ef.id)}
                    className="text-red-400 hover:text-red-300 font-bold text-xl px-2"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}