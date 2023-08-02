import "@logseq/libs";

export const getLastBlock = async function (pageName) {
  let blocks = await logseq.Editor.getPageBlocksTree(pageName);
  if (!blocks || blocks.length === 0) {
    await logseq.Editor.createPage(pageName);
  }

  blocks = await logseq.Editor.getPageBlocksTree(pageName);
  return blocks[blocks.length - 1];
};

// This is necessary instead of getCurrentPage as it does not work for journals
async function getCurrentPage() {
  const block = await window.logseq.Editor.getCurrentBlock();
  const page = await window.logseq.Editor.getPage(block.page.id);
  return page;
}

function getRefileLocation(page) {
  let targetPage = page.properties?.refileLocation;
  if (!targetPage) targetPage = page.originalName + "/Complete";
  return targetPage;
}

async function refileCompleted(e) {
  console.log("Refiling completed");

  const page = await getCurrentPage();
  const targetPage = getRefileLocation(page);

  const blocks = await window.logseq.Editor.getPageBlocksTree(page.originalName);
  const atBlock = await getLastBlock(targetPage);

  blocks.forEach((block) => {
    if (block.marker == "DONE" || block.marker == "CANCELED") {
      // We take the last block and insert these blocks as siblings after it
      logseq.Editor.moveBlock(block.uuid, atBlock.uuid, { sibling: true });
    }
  });

  logseq.UI.showMsg("Refiled all completed items to " + targetPage);
}

async function refileItem(e) {
  console.log("Refiling item");

  const page = await getCurrentPage();
  const targetPage = getRefileLocation(page);

  const block = await window.logseq.Editor.getCurrentBlock();
  const atBlock = await getLastBlock(targetPage);

  // We take the last block and insert these blocks as siblings after it
  logseq.Editor.moveBlock(block.uuid, atBlock.uuid, { sibling: true });

  logseq.UI.showMsg("Refiled item to " + targetPage);
}

const main = async () => {
  console.log("Refile plugin loaded");
  logseq.Editor.registerSlashCommand("Refile Completed", async (e) => {
    refileCompleted(e);
  });

  logseq.Editor.registerSlashCommand("Refile Item", async (e) => {
    refileItem(e);
  });
};

logseq.ready(main).catch(console.error);
