{
  description = "Austin Rifle Club website development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        # Script to patch workerd binaries for NixOS
        patchWorkerd = pkgs.writeShellScriptBin "arc-patch-workerd" ''
          INTERPRETER=$(cat ${pkgs.stdenv.cc}/nix-support/dynamic-linker)
          RPATH="${pkgs.stdenv.cc.cc.lib}/lib:${pkgs.zlib}/lib"

          for workerd in node_modules/@cloudflare/workerd-linux-64/bin/workerd web/node_modules/@cloudflare/workerd-linux-64/bin/workerd; do
            if [ -f "$workerd" ]; then
              echo "Patching $workerd..."
              ${pkgs.patchelf}/bin/patchelf --set-interpreter "$INTERPRETER" --set-rpath "$RPATH" "$workerd"
            fi
          done
          echo "Done! workerd binaries patched for NixOS."
        '';
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            nodePackages.pnpm
            sqlite
            git
            jq
            curl
            patchelf
            patchWorkerd
          ];

          shellHook = ''
            echo ""
            echo "🎯 Austin Rifle Club Dev Environment"
            echo "===================================="
            echo ""
            echo "First time setup:"
            echo "  1. npm install && cd web && npm install && cd .."
            echo "  2. arc-patch-workerd    # Patch workerd for NixOS"
            echo "  3. npx drizzle-kit generate"
            echo "  4. npx wrangler d1 migrations apply austinrifleclub-db --local"
            echo ""
            echo "Start dev servers:"
            echo "  npm run dev             # API backend (port 8787)"
            echo "  cd web && npm run dev   # Frontend (port 4321)"
            echo ""

            export PATH="$PWD/node_modules/.bin:$PWD/web/node_modules/.bin:$PATH"
          '';
        };
      }
    );
}
