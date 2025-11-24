// test-pmengine.js — FULL PMENGINE TEST SUITE (CORRETTO)

const BASE_URL = "http://127.0.0.1:3100/execute";

async function call(action, payload) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tool: "PMEngine",
      toolInput: { action, payload },
    }),
  });
  return response.json();
}

function log(title, data) {
  console.log("\n==============================");
  console.log("TEST:", title);
  console.log("==============================");
  console.log(JSON.stringify(data, null, 2));
}

(async () => {
  console.log("\n🚀 AVVIO TEST AUTOMATICI COMPLETI PMENGINE");

  //
  // ────────────────────────────────────────────────
  // 1️⃣ CLIENT CRUD
  // ────────────────────────────────────────────────
  //

  // CREATE
  const clientName = "Cliente API Test";
  const updatedClientName = "Cliente API Test Updated";

  const c1 = await call("create_client", {
    name: clientName,
    email: "client.api@test.com",
  });
  log("Create Client", c1);

  // UPDATE #1 - name
  const cu1 = await call("update_client", {
    name: clientName,
    fields: { name: updatedClientName },
  });
  log("Update Client Name", cu1);

  // UPDATE #2 - email
  const cu2 = await call("update_client", {
    name: updatedClientName,
    fields: { email: "newemail@test.com" },
  });
  log("Update Client Email", cu2);

  // UPDATE NOT FOUND
  const cNF = await call("update_client", {
    name: "ClienteFintoXYZ123",
    fields: { email: "fail@test.com" },
  });
  log("Update Client NOT FOUND", cNF);

  //
  // ────────────────────────────────────────────────
  // 2️⃣ PROJECT CRUD
  // ────────────────────────────────────────────────
  //

  // CREATE PROJECT
  const projectName = "Progetto API Test";
  const updatedProjectName = "Progetto API Test Updated";

  const p1 = await call("create_project", {
    title: projectName,
    priority: "Alta",
    deadline: "2025-12-20",
    client: updatedClientName,
  });
  log("Create Project + Link to Client", p1);

  // UPDATE PROJECT #1
  const pu1 = await call("update_project", {
    title: projectName,
    fields: { title: updatedProjectName },
  });
  log("Update Project Title", pu1);

  // UPDATE PROJECT #2
  const pu2 = await call("update_project", {
    title: updatedProjectName,
    fields: { priority: "Media" },
  });
  log("Update Project Priority", pu2);

  // UPDATE PROJECT #3
  const pu3 = await call("update_project", {
    title: updatedProjectName,
    fields: { deadline: "2025-12-31" },
  });
  log("Update Project Deadline", pu3);

  // DELETE PROJECT NOT FOUND
  const pNF = await call("delete_project", {
    title: "ProgettoFintoXYZ999",
  });
  log("Delete Project NOT FOUND", pNF);

  //
  // ────────────────────────────────────────────────
  // 3️⃣ TASK CRUD + RELAZIONI
  // ────────────────────────────────────────────────
  //

  const taskName = "Task API Test";

  const t1 = await call("create_task", {
    title: taskName,
    priority: "High",
    deadline: "2025-12-01",
    project: updatedProjectName,
    client: updatedClientName,
  });
  log("Create Task + Link Project + Client", t1);

  // UPDATE TASK #1
  const tu1 = await call("update_task", {
    title: taskName,
    fields: { status: "in progress" },
  });
  log("Update Task Status", tu1);

  // UPDATE TASK #2
  const tu2 = await call("update_task", {
    title: taskName,
    fields: { priority: "Low" },
  });
  log("Update Task Priority", tu2);

  // UPDATE TASK #3
  const tu3 = await call("update_task", {
    title: taskName,
    deadline: "2025-12-31",
  });
  log("Update Task Deadline", tu3);

  // UPDATE TASK (combined)
  const tu4 = await call("update_task", {
    title: taskName,
    fields: { status: "done", priority: "Medium" },
    deadline: "2025-11-30",
  });
  log("Update Task Combined", tu4);

  // UPDATE TASK NOT FOUND
  const tNF = await call("update_task", {
    title: "TaskFakeXYZ",
  });
  log("Update Task NOT FOUND", tNF);

  // DELETE TASK
  const td1 = await call("delete_task", {
    title: taskName,
  });
  log("Delete Task", td1);

  //
  // ────────────────────────────────────────────────
  // 4️⃣ DELETE PROJECT & CLIENT
  // ────────────────────────────────────────────────
  //

  const dp = await call("delete_project", {
    title: updatedProjectName,
  });
  log("Delete Project", dp);

  const dc = await call("delete_client", {
    name: updatedClientName,
  });
  log("Delete Client", dc);

  //
  // ────────────────────────────────────────────────
  // 5️⃣ FUZZY TEST
  // ────────────────────────────────────────────────
  //

  await call("create_client", { name: "Giovanni Rossi" });

  const fuzzy2 = await call("update_client", {
    name: "gio ro",
    fields: { email: "fuzzy@test.com" },
  });
  log("Fuzzy Matching Test", fuzzy2);

  console.log("\n🟩 TUTTI I TEST COMPLETATI\n");
})();
