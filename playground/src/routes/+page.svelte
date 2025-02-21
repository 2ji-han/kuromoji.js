<script lang="ts">
    import kuromoji from "@f1w3/kuromoji.js/index.js";
</script>

{#await kuromoji.fromURL("https://coco-ly.com/kuromoji.js/dict/") then tokenizer}
    {#each tokenizer.tokenize("すもももももももものうち") as token}
        <p>{token.surface_form} - {token.pos}</p>
    {/each}
{/await}
