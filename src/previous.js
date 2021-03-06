angular.module('ct.ui.router.extras.previous', [ 'ct.ui.router.extras.core', 'ct.ui.router.extras.transition' ]).service("$previousState",
  [ '$rootScope', '$state',
    function ($rootScope, $state) {
      var previous = null, lastPrevious = null, memos = {};

      $rootScope.$on("$transitionStart", function(evt, $transition$) {
        var from = $transition$.from;
        // Check if the fromState is navigable before tracking it.
        // Root state doesn't get decorated with $$state().  Doh.
        var fromState = from.state && from.state.$$state && from.state.$$state();
        if (fromState && fromState.navigable) {
          lastPrevious = previous;
          previous = $transition$.from;
        } else {
          $transition$.promise.then(commit)['catch'](revert);
          function commit() { lastPrevious = null; }
          function revert() { previous = lastPrevious; }
        }
      });

      var $previousState = {
        get: function (memoName) {
          return memoName ? memos[memoName] : previous;
        },
        go: function (memoName, options) {
          var to = $previousState.get(memoName);
          return $state.go(to.state, to.params, options);
        },
        memo: function (memoName, defaultStateName, defaultStateParams) {
          memos[memoName] = previous || { state: $state.get(defaultStateName), params: defaultStateParams };
        },
        forget: function (memoName) {
          if (memoName) {
            delete memos[memoName];
          } else {
            previous = undefined;
          }
        }
      };

      return $previousState;
    }
  ]
);

angular.module('ct.ui.router.extras.previous').run(['$previousState', function ($previousState) {
  // Inject $previousState so it can register $rootScope events
}]);
