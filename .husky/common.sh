HOOK_INIT="$(dirname -- "$0")/.hook_init"
if [ -f $HOOK_INIT ]; then
  echo "sourcing $HOOK_INIT"
  . $HOOK_INIT
fi
