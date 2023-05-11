import "@logseq/libs";

export const getLastBlock = async function (pageName) {
  const blocks = await logseq.Editor.getPageBlocksTree(pageName);
  if (blocks.length === 0) {
    return null;
  }
  return blocks[blocks.length - 1];
};

async function refileBacklog(e) {
  console.log("Refiling backlogs");

  const page = await window.logseq.Editor.getCurrentPage();
  const targetPage = page.originalName + "/Complete";

  const blocks = await window.logseq.Editor.getCurrentPageBlocksTree();
  const atBlock = await getLastBlock(targetPage);

  blocks.forEach((block) => {
    if (block.marker == "DONE" || block.marker == "CANCELED") {
      // We take the last block and insert these blocks as siblings after it
      logseq.Editor.moveBlock(block.uuid, atBlock.uuid, { sibling: true });
    }
  });

  logseq.App.showMsg("Refiled all completed items to " + targetPage);
}

const main = async () => {
  console.log("plugin loaded");
  logseq.Editor.registerSlashCommand("Refile Backlog", async (e) => {refileBacklog(e);});
};

logseq.ready(main).catch(console.error);
