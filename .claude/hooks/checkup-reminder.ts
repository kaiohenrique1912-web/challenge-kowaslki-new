/**
 * Hook "Stop" do Claude Code (registrado em .claude/settings.json).
 *
 * Quando o agente vai encerrar a resposta, confere se alguma tela mudou (arquivos de
 * apps/web/src ou packages/ui/src modificados no git) DEPOIS do último check-up contra o site
 * original (apps/web/e2e/checkup/report.md). Se mudou, impede o encerramento e pede o check-up
 * (skill `checkup-original`). Na segunda vez seguida (stop_hook_active) deixa encerrar, para
 * nunca prender o agente — por exemplo, se o site original estiver fora do ar.
 */
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..", "..");
const input = JSON.parse((await Bun.stdin.text()) || "{}") as { stop_hook_active?: boolean };
if (input.stop_hook_active) process.exit(0);

const UI_DIRS = ["apps/web/src/", "packages/ui/src/"];
const status = Bun.spawnSync(["git", "status", "--porcelain", "--untracked-files=all"], {
  cwd: root,
});
const changed = status.stdout
  .toString()
  .split("\n")
  .map((line) => line.slice(3).trim().replace(/^"|"$/g, ""))
  .filter((file) => UI_DIRS.some((dir) => file.startsWith(dir)))
  .filter((file) => existsSync(join(root, file)));
if (changed.length === 0) process.exit(0);

const report = join(root, "apps/web/e2e/checkup/report.md");
const lastCheckup = existsSync(report) ? statSync(report).mtimeMs : 0;
const newest = Math.max(...changed.map((file) => statSync(join(root, file)).mtimeMs));
if (newest <= lastCheckup) process.exit(0);

const sample = changed.slice(0, 5).join(", ");
console.log(
  JSON.stringify({
    decision: "block",
    reason:
      `Telas mudaram depois do último check-up contra o QuintoAndar ao vivo (${sample}${changed.length > 5 ? "…" : ""}). ` +
      "Antes de encerrar, siga a skill `checkup-original`: com `bun run dev` no ar, rode `bun run checkup` " +
      "(e `bun run visual` se houver print em docs/reference/), leia apps/web/e2e/checkup/report.md e os " +
      "*.compare.png, corrija as diferenças da sua mudança ou registre-as como 'feature faltando'/'aceito', " +
      "e se a feature nova existe no original, acrescente uma sonda para ela em apps/web/e2e/checkup.ts. " +
      "Se o site original bloquear o robô ou estiver fora do ar, avise o usuário em vez de insistir.",
  }),
);
