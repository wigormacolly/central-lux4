import { db } from '@/lib/db';
import { exigirAdmin } from '@/lib/auth';
import { alternarAtivo } from './actions';
import { FormConvite, BotaoNovoConvite } from './forms';

export default async function Equipe() {
  const eu = await exigirAdmin();
  const pessoas = await db()<{ id: string; nome: string; email: string; papel: string; ativo: boolean; tem_senha: boolean }[]>`
    select id, nome, email, papel, ativo, senha_hash is not null tem_senha from usuario order by criado_em`;
  return (
    <main className="stack">
      <div><div className="eyebrow">Equipe</div><h1>Quem acessa a central</h1></div>
      <div className="card tbox">
        <table className="tbl">
          <thead><tr><th>Nome</th><th>E-mail</th><th>Papel</th><th>Situação</th><th></th></tr></thead>
          <tbody>{pessoas.map(p => (
            <tr key={p.id}>
              <td>{p.nome}</td><td className="muted">{p.email}</td><td>{p.papel}</td>
              <td>{!p.ativo ? 'desativado' : p.tem_senha ? 'ativo' : 'convite pendente'}</td>
              <td className="row" style={{ justifyContent: 'flex-end' }}>
                {p.id !== eu.id && <BotaoNovoConvite id={p.id} />}
                {p.id !== eu.id && <form action={alternarAtivo.bind(null, p.id)}><button className="btn ghost">{p.ativo ? 'Desativar' : 'Reativar'}</button></form>}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="card stack" style={{ maxWidth: 560 }}>
        <h2>Convidar pessoa</h2>
        <p className="muted small" style={{ margin: 0 }}>A pessoa recebe um link para criar a própria senha. O link vale 7 dias e só funciona uma vez.</p>
        <FormConvite />
      </div>
    </main>
  );
}
