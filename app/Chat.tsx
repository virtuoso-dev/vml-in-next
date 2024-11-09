import React from "react";
import {
  VirtuosoMessageList,
  VirtuosoMessageListLicense,
  VirtuosoMessageListMethods,
  VirtuosoMessageListProps,
  useVirtuosoLocation,
  useVirtuosoMethods,
} from "@virtuoso.dev/message-list";
import { randPhrase, randTextRange } from "@ngneat/falso";

interface Message {
  key: string;
  text: string;
  user: "me" | "other";
}

let idCounter = 0;

function randomMessage(user: Message["user"]): Message {
  return {
    user,
    key: `${idCounter++}`,
    text: randTextRange({ min: user === "me" ? 20 : 100, max: 200 }),
  };
}

export default function Chat() {
  const virtuoso = React.useRef<VirtuosoMessageListMethods<Message>>(null);

  return (
    <>
      <VirtuosoMessageListLicense licenseKey="">
        <VirtuosoMessageList<Message, null>
          ref={virtuoso}
          style={{ height: 800 }}
          computeItemKey={({ data }) => data.key}
          StickyFooter={StickyFooter}
          ItemContent={({ data }) => {
            return (
              <div style={{ paddingBottom: "2rem", display: "flex" }}>
                <div
                  style={{
                    maxWidth: "50%",
                    marginLeft: data.user === "me" ? "auto" : undefined,
                    backgroundColor:
                      data.user === "me" ? "lightblue" : "lightgreen",
                    borderRadius: "1rem",
                    padding: "1rem",
                  }}
                >
                  {data.text}
                </div>
              </div>
            );
          }}
        />
      </VirtuosoMessageListLicense>
      <button
        onClick={() => {
          const myMessage = randomMessage("me");
          virtuoso.current?.data.append(
            [myMessage],
            ({ scrollInProgress, atBottom }) => {
              return {
                index: "LAST",
                align: "start",
                behavior: atBottom || scrollInProgress ? "smooth" : "auto",
              };
            },
          );

          setTimeout(() => {
            const botMessage = randomMessage("other");
            virtuoso.current?.data.append([botMessage]);

            let counter = 0;
            const interval = setInterval(() => {
              if (counter++ > 20) {
                clearInterval(interval);
              }
              virtuoso.current?.data.map((message) => {
                return message.key === botMessage.key
                  ? { ...message, text: message.text + " " + randPhrase() }
                  : message;
              }, "smooth");
            }, 150);
          }, 1000);
        }}
      >
        Ask the bot a question!
      </button>
    </>
  );
}

const StickyFooter: VirtuosoMessageListProps<
  Message,
  null
>["StickyFooter"] = () => {
  const location = useVirtuosoLocation();
  const virtuosoMethods = useVirtuosoMethods();

  return (
    <div
      style={{ display: "flex", flexDirection: "row", justifyContent: "end" }}
    >
      {!location.isAtBottom && (
        <button
          onClick={() => {
            virtuosoMethods.scrollIntoView({
              index: "LAST",
              align: "end",
              behavior: "auto",
            });
          }}
        >
          down
        </button>
      )}
    </div>
  );
};
