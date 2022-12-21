import DB from "/static/js/db.js";
import { findIndex, removeAllChildNodes } from "/static/js/tools.js";

export const db = new DB("schemaHelper");

export function exportSchema() {
  let output = JSON.parse(JSON.stringify(activeSchema));
  delete output.id;
  delete output.title;
  return output;
}

export function previewSchema() {
  saveState();
  document.querySelector("#side2 > code").innerText = JSON.stringify(
    exportSchema(),
    null,
    2
  );
}

export async function saveSchema() {
  saveState();
  let activeUrl = new URL(window.location.toString());
  let id = activeUrl.searchParams.get("id");
  if (id === null) {
    let id = await db.add(activeSchema);
    activeUrl.searchParams.set("id", id);
    window.location = activeUrl.toString();
  } else {
    await db.set(id, activeSchema);
  }
  alert("Schema saved");
}

export async function removeSchema(id) {
  await db.remove(id);
}

function handleDeleteSchemaButtonPress(event) {
  let id = parseInt(event.target.nextElementSibling.innerText.split(":")[0]);
  removeSchema(id);
  event.target.parentNode.remove();
}

export async function loadSchema() {
  let activeUrl = new URL(window.location.toString());
  let id = activeUrl.searchParams.get("id");
  if (id === null) return;
  id = parseInt(id);
  activeSchema = await db.get(id);
  if (activeSchema) {
    loadSchemaTitle(activeSchema["$id"].replace(".json", ""));
  } else {
    loadSchemaTitle("Unnamed Schema");
  }
  for (let [key, def] of Object.entries(activeSchema["$defs"])) {
    addSchemaRef(key, def.type);
  }
  loadDef();
}

async function toggleSchemaLoadModal() {
  let modal = document.querySelector("#loadModal");
  if (modal.open) {
    modal.open = false;
    return;
  }
  let target = document.querySelector("#schemaList");
  removeAllChildNodes(target);
  let list = await db.list();
  if (Object.keys(list).length === 0) {
    let tmp = document.createElement("small");
    tmp.innerText = "No saved schemas found.";
    target.appendChild(tmp);
  }
  for (let [id, name] of Object.entries(list)) {
    let container = document.createElement("DIV");
    container.classList.add("loadSchemaRow");
    let tmp = document.createElement("BUTTON");
    tmp.innerText = "close";
    tmp.classList.add("icon");
    tmp.addEventListener("click", handleDeleteSchemaButtonPress);
    container.appendChild(tmp);
    tmp = document.createElement("A");
    tmp.innerText = `${id}: ${name}`;
    tmp.href = `/?id=${id}`;
    container.appendChild(tmp);
    target.appendChild(container);
  }
  modal.showModal();
}

function createPathElement(text, link) {
  let output = document.createElement("DIV");
  output.classList.add("pathElement");
  output.innerText = text;
  return output;
}

function updatePath(source) {
  let target = document.querySelector("#pathBar");
  let index = findIndex(source);
  removeAllChildNodes(target);
  let def_key = source.querySelector(".readOnlyTitle").innerText;
  let schema_root = index === 0;
  document.querySelector("#schemaEditor-object > .card").hidden = schema_root;
  if (schema_root) {
    def_key = null;
    target.appendChild(createPathElement("/"));
  } else {
    target.appendChild(createPathElement("/"));
    target.appendChild(createPathElement("$defs"));
    target.appendChild(createPathElement("/"));
    target.appendChild(createPathElement(def_key));
  }
  let schemaObjectType = source.querySelector("button").innerText;
  schemaObjectType = typeMapping[schemaObjectType];
  for (let i of document.querySelectorAll("#side1 .editor")) {
    i.hidden = true;
  }
  loadDef(def_key);
  document.querySelector(`#schemaEditor-${schemaObjectType}`).hidden = false;
}

function loadDef(def_key) {
  let def = activeSchema;
  if (typeof def_key === "string") {
    if (!Object.keys(activeSchema["$defs"]).includes(def_key)) return;
    def = activeSchema["$defs"][def_key];
  }
  let form_fields = schema_to_forms(def);
  let target = document.querySelector(`#schemaEditor-${def.type}`);
  for (let i of target.querySelectorAll(".customInput")) {
    if (i.dataset.key === "key") {
      i.loadValue(def_key);
      continue;
    }
    if (!Object.keys(form_fields).includes(i.dataset.key)) continue;
    i.loadValue(form_fields[i.dataset.key]);
  }
  if (def.type === "object") {
    for (let [key, attribute] of Object.entries(def.properties)) {
      let form_fields = schema_to_forms(attribute);
      form_fields.required = def.required.includes(key);
      form_fields.key = key;
      addSchemaNode(form_fields);
    }
  }
}

function addSchemaNode(attributes = undefined) {
  let target = document.querySelector("#schemaEditor-object");
  let output = document.createElement("schema-node");
  target.insertBefore(output, target.querySelector(":scope > button"));
  if (attributes.type === "click") return;
  output
    .querySelector('.customInput[data-key="key"]')
    .loadValue(attributes.key);
  output
    .querySelector('.customInput[data-key="required"]')
    .loadValue(attributes.required);
  target = output.querySelector('.customInput[data-key="type"]');
  target.loadValue({ id: attributes.type });
  output.addFields(attributes.type);
  target = output.querySelectorAll(".subAttributes > .customInput");
  for (let i of target) {
    if (!Object.keys(attributes).includes(i.dataset.key)) continue;
    i.loadValue(attributes[i.dataset.key]);
  }
}

function addSchemaRef(title = null, type = null) {
  let tmp = document.createElement("schema-object");
  tmp._callbacks.pre_select = saveState;
  tmp._callbacks.selected = updatePath;
  let target = document.querySelector("nav");
  target.insertBefore(tmp, target.querySelector(":scope > button"));
  if (typeof title === "string")
    tmp.querySelector(".readOnlyTitle").innerText = title;
  if (typeof type === "string")
    tmp.querySelector(".typeButton").innerText = iconMapping[type];
}

function loadSchemaTitle(str) {
  let target = document.querySelector("header > h1 > input");
  target.value = str;
}

function setSchemaTitle(event) {
  let title = event.target.value;
  activeSchema["title"] = title;
  activeSchema["$id"] = title + ".json";
}

function export_text_attribute(editor) {
  let output = {};
  output.type = "text";
  output.title = editor
    .querySelector('.customInput[data-key="title"')
    .getInputValue();
  output.minLength = editor
    .querySelector('.customInput[data-key="minLength"')
    .getInputValue();
  output.maxLength = editor
    .querySelector('.customInput[data-key="maxLength"')
    .getInputValue();
  output.pattern = editor
    .querySelector('.customInput[data-key="pattern"')
    .getInputValue();
  output.format = editor
    .querySelector('.customInput[data-key="format"')
    .getInputValue();
  return output;
}

function export_number_attribute(editor) {
  let output = {};
  output.type = "number";
  output.title = editor
    .querySelector('.customInput[data-key="title"')
    .getInputValue();
  output.minimum = editor
    .querySelector('.customInput[data-key="minimum"')
    .getInputValue();
  output.maximum = editor
    .querySelector('.customInput[data-key="maximum"')
    .getInputValue();
  output.exclusiveMinimum = editor
    .querySelector('.customInput[data-key="exclusiveMinimum"')
    .getInputValue();
  output.exclusiveMaximum = editor
    .querySelector('.customInput[data-key="exclusiveMaximum"')
    .getInputValue();
  output.multipleOf = editor
    .querySelector('.customInput[data-key="multipleOf"')
    .getInputValue();
  let allow_float = editor
    .querySelector('.customInput[data-key="floatType"')
    .getInputValue();
  if (allow_float) output.type = "float";
  return output;
}

function export_boolean_attribute(editor) {
  let output = {};
  output.type = "boolean";
  output.title = editor
    .querySelector('.customInput[data-key="title"')
    .getInputValue();
  let allowDefault = editor
    .querySelector('.customInput[data-key="allowDefault"')
    .getInputValue();
  if (allowDefault) {
    output.default = editor
      .querySelector('.customInput[data-key="default"')
      .getInputValue();
  }
  return output;
}

function export_object_attribute(editor) {
  let output = {};
  output.type = "object";
  output.title = editor
    .querySelector('.customInput[data-key="title"')
    .getInputValue();
  output.required = [];
  output.properties = {};
  for (let attribute_editor of editor.querySelectorAll("schema-node")) {
    let attribute = {};
    attribute.type = attribute_editor
      .querySelector('.customInput[data-key="type"]')
      .getInputValue().id; // .id is needed because it's a multi-select
    let attribute_properties = null;
    if (attribute.type === "object") {
      attribute_properties = export_object_attribute(attribute_editor);
    } else if (attribute.type === "text") {
      attribute_properties = export_text_attribute(attribute_editor);
    } else if (attribute.type === "number") {
      attribute_properties = export_number_attribute(attribute_editor);
    } else if (attribute.type === "boolean") {
      attribute_properties = export_boolean_attribute(attribute_editor);
    } else if (attribute.type === "array") {
      attribute_properties = export_array_attribute(attribute_editor);
    }
    attribute = { ...attribute, ...attribute_properties };
    let attribute_key = attribute_editor
      .querySelector('.customInput[data-key="key"]')
      .getInputValue();
    let required = attribute_editor
      .querySelector('.customInput[data-key="required"]')
      .getInputValue();
    if (required) output.required.push(attribute_key);
    output.properties[attribute_key] = attribute;
  }
  return output;
}

function export_array_attribute(editor) {
  let output = {};
  return output;
}

function saveState() {
  let target = document.querySelector("nav > .selected");
  let def = findIndex(target) > 0;
  if (def) def = target.querySelector(".readOnlyTitle").innerText;
  let editor = document.querySelector("#side1 > div:not([hidden])");
  let editor_type = editor.id.replace("schemaEditor-", "");
  let output = {};
  if (editor_type === "object") {
    output = export_object_attribute(editor);
  } else if (editor_type === "text") {
    output = export_text_attribute(editor);
  } else if (editor_type === "number") {
    output = export_number_attribute(editor);
  } else if (editor_type === "boolean") {
    output = export_boolean_attribute(editor);
  } else if (editor_type === "array") {
    output = export_array_attribute(editor);
  }
  if (def) {
    activeSchema["$defs"][def] = output;
  } else {
    activeSchema = { ...activeSchema, ...output };
  }
}

export async function initMainPage() {
  await db.init();
  await loadSchema();

  console.log("Hello test");

  // document.querySelector("#saveSchemaButton").onclick = saveSchema;
  // document.querySelector("#previewSchemaButton").onclick = previewSchema;
  // document.querySelector("#openSchemaButton").onclick = toggleSchemaLoadModal;
  // document.querySelector("nav > button").onclick = addSchemaRef;
  // document.querySelector("#schemaEditor-object > button").onclick =
  //   addSchemaNode;

  // document.querySelector("nav > schema-object .readOnlyTitle").innerText =
  //   "Schema Root";
  // document.querySelector("nav > schema-object")._callbacks.pre_select =
  //   saveState;
  // document.querySelector("nav > schema-object")._callbacks.selected =
  //   updatePath;
  // let t = document.querySelectorAll("nav > schema-object:first-child > button");
  // for (let i of t) i.disabled = true;
  // document
  //   .querySelector("header > h1 > input")
  //   .addEventListener("change", setSchemaTitle);
}
