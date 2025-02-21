<script lang="ts">
    import kuromoji from "@f1w3/kuromoji.js/index.js";
    import type { Tokenizer } from "../../../built/esm/tokenizer.js";
    import { onMount } from "svelte";

    let tokenizer = $state<Tokenizer>();
    let text = $state<string>("すもももももももものうち");
    let tokens = $derived.by(() => {
        if (tokenizer && text) {
            return tokenizer.tokenize(text);
        }
        return [];
    });
    let tokensMerged = $derived.by(() => {
        if (tokenizer && text) {
            const tokens = tokenizer.tokenize(text);
            // merge tokens
            let prev = tokens[0];
            let i = 1;
            while (i < tokens.length) {
                const token = tokens[i];
                if (prev.pos === token.pos) {
                    prev.surface_form += token.surface_form;
                    tokens.splice(i, 1);
                } else {
                    prev = token;
                    i++;
                }
            }
            return tokens;
        }
        return [];
    });

    onMount(async () => {
        tokenizer = await kuromoji.fromURL(
            "https://coco-ly.com/kuromoji.js/dict/",
        );
    });
</script>

<!-- 
{#await kuromoji.fromURL("https://coco-ly.com/kuromoji.js/dict/") then tokenizer}
    {#each tokenizer.tokenize("すもももももももものうち") as token}
        <p>{token.surface_form} - {token.pos}</p>
    {/each}
{/await} -->
<main>
    <div class="top">
        <div class="tokens">
            <h2>Tokens</h2>
            {#each tokens as token}
                <ruby class:rt={token.pos === "名詞"}>
                    {token.surface_form}
                </ruby>
            {/each}
        </div>
        <div class="tokens">
            <h2>Merged Tokens</h2>
            {#each tokensMerged as token}
                <ruby class:rt={token.pos === "名詞"}>
                    {token.surface_form}
                </ruby>
            {/each}
        </div>
        <div class="debug">{JSON.stringify(tokens, null, 2)}</div>
    </div>
    <div class="bottom">
        <textarea bind:value={text}></textarea>
    </div>
</main>

<style>
    main {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #666;
    }

    main > div {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        background: #f0f0f0;
        display: flex;
        overflow-x: auto;
    }

    h2 {
        width: 100%;
    }

    .debug {
        min-width: 28rem;
        padding: 1rem;
        margin: 3px;
        font-size: 0.75rem;
        background: #fff;
        white-space: pre-wrap;
        overflow: auto;
    }

    div::-webkit-scrollbar {
        width: 8px;
    }

    div::-webkit-scrollbar-track {
        background: #eaeaea;
        border-radius: 1px;
    }

    div::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, #222 10%, transparent 0%);
        border: 1px solid #eaeaea;
        border-radius: 2px;
    }

    textarea {
        width: 100%;
        height: 100%;
        border: none;
        resize: none;
        padding: 4rem;
        background: #fff;
    }

    textarea:focus {
        outline: none;
    }

    .tokens {
        flex: 1;
        height: 100%;
        padding: 4rem;
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        white-space: nowrap;
        overflow-x: auto;
    }

    ruby {
        ruby-align: start;
        font-size: 1rem;
    }

    ruby.rt {
        margin: 0 0.25rem;
        font-weight: 600;
        font-size: 1.5rem;
        color: #333;
        border-bottom: 1px solid #333;
    }
</style>
