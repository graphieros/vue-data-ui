<script setup lang="ts">
//@ts-ignore
import BaseIcon from "../../../src/atoms/BaseIcon.vue"
</script>

<template>
  <main>
    <h1 class="gradient-text">Welcome to the vue-data-ui manual testing arena</h1>
    <div class="prereq">
      <ol>
        <li>
          Make sure to build the package at the root of the main project:
          <ul>
            <li><code>npm i</code></li>
            <li><code>npm run prod</code> runs all tests before building the package. Run it when it is your first time, or before submitting a PR, since <strong>all tests must pass.</strong></li>
            <li><code>npm run preprod</code> skips tests and builds the package. Run this during dev, to test the build versions of modified components in the arena.</li>
          </ul>
        </li>

        <li>
          cd into the manual-testing directory:
          <ul>
            <li><code>npm run dev</code> adds the local package to the testing directory and runs the testing app</li>
            <li>changes made to the library components will be reflected live on the local instances of tested components, which can be compared to their state from the current build.</li>
          </ul>
        </li>

        <li>
          Change datasets, tweak configs inside Arena{component} files
        </li>

        <li>
          🎉 Thank you for contributing to vue-data-ui !
        </li>
      </ol>
    </div>

    <div class="hint">
      <BaseIcon stroke="#83a4f2" name="arrowLeft"/>Select a component to start testing...
    </div>
  </main>
</template>

<style scoped>
h1 {
  margin-bottom: 2rem;
  width: fit-content;
  font-weight: bolder;
}

.hint {
  display: flex;
  flex-direction: row;
  align-items:center;
  gap: 1rem;
  font-size: 1.5rem;
}

.prereq {
  margin-bottom: 2rem;
}

code {
  color: #42d392;
  background: #2A2A2A;
  padding: 0.2rem;
}
strong {
  font-weight:bolder;
  color: #5f8aee;
}

ol li {
  font-weight: bolder;
  margin-bottom: 1rem;
}

ul li {
  font-weight: normal;
  margin-bottom: 0;
}
</style>