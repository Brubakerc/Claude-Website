/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    // Set by the project page so body components can find files in the project's folder.
    project?: { id: string; cover: ImageMetadata };
  }
}
