const useUtilsHooks = () => {
  const getTargetServiceName = async (services, target) => {
    const currentService = services.find((service) => service.id === target);

    return currentService.name;
  };

  const getTargetLocationName = async (locations, target) => {
    const currentLocation = locations.find(
      (location) => location.id === target
    );

    return currentLocation.name;
  };

  return {
    getTargetServiceName,
    getTargetLocationName,
  };
};

export default useUtilsHooks;
