async function readUrl(url) {
  const utf8Decoder = new TextDecoder("utf-8");
  const response = await fetch(url);

  if (!response.ok) return;

  const re = /\n|\r|\r\n/gm;
  let startIndex = 0;
  let count = 0;

  const reader = response.body.getReader();
  let { value, done } = await reader.read();
  value = value ? utf8Decoder.decode(value) : "";

  for (;;) {
    let result = re.exec(value);

    if (!result) {
      if (done) {
        console.log("eof");
        break;
      }

      let remainder = value.substring(startIndex);
      console.log("reading...");
      ({ value, done } = await reader.read());
      console.log("read", count);

      value = remainder + (value ? utf8Decoder.decode(value) : "");

      startIndex = re.lastIndex = 0;
      continue;
    }

    count++;
  }

  if (startIndex < value.length) {
    count++;
  }

  console.log("done, lines:", count);
}

self.addEventListener("message", (event) => {
  readUrl(event.data.url);
});
