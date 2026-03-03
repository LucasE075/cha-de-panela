import { Routes, Route } from 'react-router-dom'

import IdentificacaoPage from '../pages/Identificacao/IdentificacaoPage'
import IntroducaoPage from '../pages/Introducao/IntroducaoPage'
import PresentesPage from '../pages/Presentes/PresentesPage'
import MeusPresentesPage from '../pages/MeusPresentes/MeusPresentesPage'
import ConfirmacaoPage from '../pages/Confirmacao/ConfirmacaoPage'
import AgradecimentoPage from '../pages/Agradecimento/AgradecimentoPage'
import AdminConvidadosPage from '../pages/AdminConvidados/AdminConvidadosPage'
import AdminPresentesPage from '../pages/AdminPresentes/AdminPresentesPage'
import AdminUIPage from '../pages/AdminUI/AdminUIPage'
import PixPage from '../pages/Pix/PixPage'


export default function AppRoutes() {
  return (
      <Routes>
        <Route path="/" element={<IdentificacaoPage />} />
        <Route path="*" element={<div>404</div>} />
        <Route path="/introducao" element={<IntroducaoPage />} />
        <Route path="/presentes" element={<PresentesPage />} />
        <Route path="/meus-presentes" element={<MeusPresentesPage />} />
        <Route path="/confirmacao" element={<ConfirmacaoPage />} />
        <Route path="/agradecimento" element={<AgradecimentoPage />} />
        <Route path="/pix" element={<PixPage />} />
        <Route path="/admin/convidados" element={<AdminConvidadosPage />} />
        <Route path="/admin/presentes" element={<AdminPresentesPage />} />
        <Route path="/admin/UI" element={<AdminUIPage />} />
      </Routes>
  )
}
